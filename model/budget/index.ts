/*
 * @Author: Mr.He 
 * @Date: 2017-12-20 18:56:43 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-01-24 14:09:41
 * @content what is the content of this file. */

export * from "./interface";
export * from "./strategy";

import { analyzeBudgetParams } from "./analyzeParams";
import { STEP, BudgetOrder, DataOrder, BudgetType, SearchHotelParams, SearchTicketParams, BudgetFinallyResult, GetBudgetParams } from "./interface";
import uuid = require("uuid");
var API = require("@jingli/dnode-api");
import getAllPrefer from "./getAllPrefer";
import computeBudget from "./computeBudget";
const cache = require("common/cache");
let request = require("request-promise");
import { verifySign, genSign } from '@jingli/sign';
import { conf, auth } from 'server-auth';
import config = require("@jingli/config");
import { CityService } from "_types/city";
import { Models } from "_types";
import { clearTimeout } from 'timers';
import { BudgetHelps } from "./helper";

export class Budget extends BudgetHelps {
    constructor() {
        super();
    }
    async getBudget(params: GetBudgetParams): Promise<BudgetFinallyResult> {
        let { callbackUrl, requestBudgetParams, companyId, travelPolicyId, staffs, expectStep = STEP.CACHE } = params;

        console.log('params ===========>', params);
        let times = Date.now();
        //后期考虑 针对不同的用户生成不同的预算
        let staff = staffs[0];
        let segments = analyzeBudgetParams(params) as DataOrder[];

        /* create budget order */
        let budgetOrder = {
            id: uuid.v1(),
            budgetData: [],
            callbackUrl,
            params
        } as BudgetOrder;

        /* perfect the dataOrders. */
        for (let segment of segments) {
            segment.channels = [];
            segment.step = expectStep;     //预期数据类型
            segment.data = [];
            budgetOrder.budgetData.push(segment);
        }

        /* request data-store */
        let ps = budgetOrder.budgetData.map(async (item: DataOrder, index) => {
            //全价数据获取，如果出错直接抛出
            let dataStore = this.requestDataStore(item);
            //获取prefer
            let prefer = getAllPrefer.getPrefer({
                companyId,
                travelPolicyId,
                staff,
                type: item.type,
                input: item.input
            });

            //获取补助，之后获取

            let ps = await Promise.all([await dataStore, await prefer]);
            item.data = ps[0].data;
            item.step = ps[0].step;
            item.channels = ps[0].channels;
            item.prefer = ps[1];

            //进行打分，得出最终预算
            item.budget = await computeBudget.getBudget(item);
            item.budget.index = item.index; //方便前端分组
            return item;
        });

        budgetOrder.budgetData = await Promise.all(ps);

        /* 整理预算数据输出 */
        let finallyResult = {
            budgets: [],
            step: STEP.FINAL
        } as BudgetFinallyResult;
        budgetOrder.step = STEP.FINAL;
        for (let item of budgetOrder.budgetData) {
            finallyResult.budgets.push(item.budget);
            if (item.step != STEP.FINAL) {
                budgetOrder.step = STEP.CACHE;
            }
        }

        if (budgetOrder.step != STEP.FINAL) {
            //10s 后拉取最终预算
            this.getFinalBudget(budgetOrder, finallyResult);
        }

        finallyResult.step = budgetOrder.step;
        console.log("using time : ", Date.now() - times);
        console.log("第一次预算获取结果：", finallyResult);
        let budgetItem = Models.budget.create({
            id: budgetOrder.id,
            query: budgetOrder.params,
            result: finallyResult
        });
        await budgetItem.save();
        return finallyResult;
    }

    async getFinalBudget(budgetOrder: BudgetOrder, result: any, num?: number) {
        num = num ? num : 0;
        let time = Date.now();
        let ps = budgetOrder.budgetData.map(async (item) => {
            if (item.step == STEP.FINAL) {
                return item;
            }

            item.step = STEP.FINAL;  //预期final数据
            try {
                let dataStore = await this.requestDataStore(item);
                if (dataStore.data && dataStore.data.length) {
                    item.data = dataStore.data;
                    item.step = dataStore.step;
                    item.channels = dataStore.channels;
                }
            } catch (e) {
                console.error("requestDataStore error !!!");
                console.error(e);
            }

            return item;
        });

        try {
            budgetOrder.budgetData = await function (): Promise<DataOrder[]> {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject("DataStore FIN data, request Time out!");
                    }, 1.5 * 60 * 1000);
                    Promise.all(ps).then((result: DataOrder[]) => {
                        resolve(result);
                    })
                });
            }();
        } catch (e) {
            console.log(e);
        }

        /* 整理预算数据输出 */
        let finallyResult = {
            budgets: [],
            step: STEP.FINAL
        } as BudgetFinallyResult;
        //计算打分
        budgetOrder.step = STEP.FINAL;
        for (let item of budgetOrder.budgetData) {
            item.budget = await computeBudget.getBudget(item);
            item.budget.index = item.index;
            /* if (item.step != STEP.FINAL) {
                num++;
                if (num < 3) {
                    console.error("data-store 返回的数据不是全 FIN; 尝试重新拉取 第", num, "次");
                    return await this.getFinalBudget(budgetOrder, result, num);
                }
            } */
            finallyResult.budgets.push(item.budget);
        }

        console.log("finalBudget Time using: ", Date.now() - time);
        let budgetItem = await Models.budget.get(budgetOrder.id);
        if (budgetItem) {
            budgetItem.resultFinally = finallyResult;
            await budgetItem.save();
        }

        await this.sendBudget(finallyResult, budgetOrder.callbackUrl);
    }

    /* 执行发送 5 次逻辑，5次后最终报错 */
    async sendBudget(result: any, callbackUrl: string, num?: number) {
        num = num ? num : 0;
        if (!callbackUrl) {
            return;
        }
        // console.log("sendBudget  sendBudget  ===>", callbackUrl);
        console.log("sendBudget sendBudget ************************************** ", num, "    ", result);

        let timestamp = Math.ceil(Date.now() / 1000);
        let sign = genSign(result, timestamp, config.agent.appSecret);
        try {
            let ret = await request({
                uri: callbackUrl,
                method: "post",
                body: result,
                headers: {
                    appid: config.agent.appId,
                    sign: sign
                },
                json: true
            });
            console.info("事件推送返回值", ret);
        } catch (e) {
            console.error("事件推送失败, 次数：", num);
            console.error(e);
            num++;
            if (num >= 5) {
                console.error("*****", num, " 次后还是失败。事件推送失败!");
                return;
            } else {
                setTimeout(async () => {
                    this.sendBudget(result, callbackUrl, num);
                }, num * 1000);
            }
        }
    }

    async requestDataStore(params: any) {
        /* 服务稳定后，应当对请求错误执行重复拉取 */
        return await request({
            uri: config.dataStore + "/searchData",
            method: "post",
            body: params,
            json: true
        });
    }
}

export let budget = new Budget();



let params = {
    preferedCurrency: 'CNY',
    travelPolicyId: 'bb2d6960-acd0-11e7-80a9-d1533e629a64',
    companyId: '935fbeb0-acd0-11e7-ab1e-bdc5d9f254d3',
    staffs: [{ gender: 1, policy: 'domestic' }],
    destinationPlacesInfo:
        [{
            destinationPlace: 'CT_150',
            leaveDate: '2018-01-20T10:00:00.000Z',
            goBackDate: '2018-01-21T01:00:00.000Z',
            latestArrivalDateTime: '2018-01-20T10:00:00.000Z',
            earliestGoBackDateTime: '2018-01-21T01:00:00.000Z',
            isNeedTraffic: true,
            isNeedHotel: true,
            reason: ''
        }],
    originPlace: 'CT_131',
    isRoundTrip: true,
    goBackPlace: 'CT_131'
};

let params2 = {
    "callbackUrl": "abcdf",
    "travelPolicyId": "ae6e7050-af2a-11e7-abf6-9f811e5a6ff9",
    "companyId": "e3e7e690-1b7c-11e7-a571-7fedc950bceb",
    // "expectStep": STEP.FULL,
    "staffs": [
        {
            "gender": 1,
            "policy": "domestic"
        }
    ],
    "originPlace": "CT_075",
    "goBackPlace": "CT_075",
    "isRoundTrip": false,
    "destinationPlacesInfo":
        [{
            "destinationPlace": "CT_289",
            "leaveDate": "2018-01-26T10:00:00.000Z",
            "goBackDate": "2018-01-27T01:00:00.000Z",
            "latestArrivalDateTime": "2018-01-26T10:00:00.000Z",
            "earliestGoBackDateTime": "2018-01-27T01:00:00.000Z",
            "isNeedTraffic": true,
            "isNeedHotel": false,
            "reason": ""
        },
        {
            "destinationPlace": "CT_131",
            "leaveDate": "2018-01-27T10:00:00.000Z",
            "goBackDate": "2018-01-28T01:00:00.000Z",
            "latestArrivalDateTime": "2018-01-27T10:00:00.000Z",
            "earliestGoBackDateTime": "2018-01-28T01:00:00.000Z",
            "isNeedTraffic": true,
            "isNeedHotel": true,
            "reason": ""
        }]
};


let testFn = async () => {
    let result = await budget.getBudget(params2)

    console.log("result result ===>", result);

}

/* let goTest = 1;
if (goTest) {
    for (let i = 0; i < 1; i++) {
        setTimeout(testFn, 8000);
    }
} */