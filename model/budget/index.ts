/*
 * @Author: Mr.He 
 * @Date: 2017-12-20 18:56:43 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2017-12-22 19:04:36
 * @content what is the content of this file. */

export * from "./interface";
export * from "./dataEvent";
export * from "./strategy";

import { CreateBudgetParams, analyzeBudgetParams } from "./analyzeParams";
import { STEP, BudgetOrder, DataOrder, BudgetType, SearchHotelParams, SearchTicketParams } from "./interface";
import uuid = require("uuid");
var API = require("@jingli/dnode-api");
import getAllPrefer from "./getAllPrefer";
import computeBudget from "./computeBudget";
import { dataEvent } from 'model/budget';
const cache = require("common/cache");



export interface GetBudgetParams {
    [index: string]: any;               //qmtrip 回传的其它信息
    requestBudgetParams: CreateBudgetParams
}

export class Budget {
    async getBudget(params: GetBudgetParams) {
        let { qmUrl, requestBudgetParams, companyId, travelPolicyId, staffs } = params;

        let times = Date.now();

        //后期考虑 针对不同的用户生成不同的预算
        let staff = staffs[0];

        let segments = analyzeBudgetParams(requestBudgetParams) as DataOrder[];

        /* create budget order */
        let budgetOrder = {
            id: uuid.v1(),
            budgetData: [],
            callbackUrl: qmUrl,
            step: STEP.CACHE
        } as BudgetOrder;

        /* perfect the dataOrders. */
        for (let segment of segments) {
            segment.orderId = budgetOrder.id;
            segment.channels = [];
            segment.step = STEP.CACHE;
            segment.data = [];
            segment.callbackUrl = "http://localhost:3003";
            budgetOrder.budgetData.push(segment);
        }

        /* request data-store */
        let ps = budgetOrder.budgetData.map(async (item: DataOrder, index) => {
            //全价数据获取，如果出错直接抛出
            let data = API.getData.getData(item);
            console.log("******************");

            //获取prefer
            let prefer = getAllPrefer.getPrefer({
                companyId,
                travelPolicyId,
                staff,
                type: item.type,
                input: item.input
            });

            //获取补助，之后获取

            let ps = await Promise.all([await data, await prefer]);
            item.data = ps[0];
            item.prefer = ps[1];

            //进行打分，得出最终预算
            item.budget = await computeBudget.getBudget(item);
            item.budget.index = item.index; //方便前端分组
            return item;
        });

        budgetOrder.budgetData = await Promise.all(ps);

        /* save budget order */
        await dataEvent.addBudgetOrderCache(budgetOrder);

        /* 整理预算数据输出 */
        let finallyResult = {
            budgets: [],
            step: STEP.FINAL
        };
        for (let item of budgetOrder.budgetData) {
            if (item.step != STEP.FINAL) {
                finallyResult.step = STEP.CACHE;
            }
            finallyResult.budgets.push(item.budget);
        }


        console.log("using time : ", Date.now() - times);

        if (finallyResult.step != STEP.FINAL) {
            //10s 后拉取最终预算
            setTimeout(() => {
                this.getFinalBudget(budgetOrder.id);
            }, 10000);
        }

        console.log(STEP.CACHE);
        return finallyResult;
    }

    async getFinalBudget(budgetOrderId: string) {
        let budgetOrder = await cache.read(budgetOrderId) as BudgetOrder;

        let ps = budgetOrder.budgetData.map(async (item) => {
            if (item.step == STEP.FINAL) {
                return item;
            }

            let data = await API.getData.getData(item);
            item.data = data;
            return item;
        });

        budgetOrder.budgetData = await Promise.all(ps);

        //计算打分
        budgetOrder.step = STEP.FINAL;
        for (let item of budgetOrder.budgetData) {
            item.budget = await computeBudget.getBudget(item);
            if (item.step != STEP.FINAL) {
                console.error("data-store 返回的数据不是全 FIN");
            }
        }

        await dataEvent.sendBudget(budgetOrder);
        //delete the budgetOrder in cache.
        await cache.remove(budgetOrder.id);
    }
}

export let budget = new Budget();



let params = {
    originPlace: '',
    goBackPlace: '',
    isRoundTrip: false,
    destinationPlacesInfo:
        [{
            destinationPlace: 'CT_075',
            leaveDate: "2017-11-26T10:00:00.000Z",
            goBackDate: "2017-11-27T01:00:00.000Z",
            latestArrivalDateTime: "2017-11-26T10:00:00.000Z",
            earliestGoBackDateTime: "2017-11-27T01:00:00.000Z",
            isNeedTraffic: true,
            isNeedHotel: true,
            reason: ''
        },
            /* {
                destinationPlace: 'CT_289',
                leaveDate: "2017-11-27T10:00:00.000Z",
                goBackDate: "2017-11-28T01:00:00.000Z",
                latestArrivalDateTime: "2017-11-27T10:00:00.000Z",
                earliestGoBackDateTime: "2017-11-28T01:00:00.000Z",
                isNeedTraffic: true,
                isNeedHotel: true,
                reason: ''
            },
            {
                destinationPlace: 'CT_179',
                leaveDate: "2017-11-28T10:00:00.000Z",
                goBackDate: "2017-11-29T01:00:00.000Z",
                latestArrivalDateTime: "2017-11-28T10:00:00.000Z",
                earliestGoBackDateTime: "2017-11-29T01:00:00.000Z",
                isNeedTraffic: true,
                isNeedHotel: true,
                reason: ''
            } */
        ],
};




setTimeout(async () => {
    console.log("go go");
    await budget.getBudget({
        requestBudgetParams: params,
        qmUrl: "",
        "travelPolicyId": "ae6e7050-af2a-11e7-abf6-9f811e5a6ff9",
        "companyId": "e3e7e690-1b7c-11e7-a571-7fedc950bceb",
        "staffs": [
            {
                "gender": 1,
                "policy": "domestic"
            }
        ]
    })
}, 15000);