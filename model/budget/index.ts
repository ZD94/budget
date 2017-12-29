/*
 * @Author: Mr.He 
 * @Date: 2017-12-20 18:56:43 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2017-12-28 10:42:05
 * @content what is the content of this file. */

export * from "./interface";
export * from "./strategy";

import { CreateBudgetParams, analyzeBudgetParams } from "./analyzeParams";
import { STEP, BudgetOrder, DataOrder, BudgetType, SearchHotelParams, SearchTicketParams } from "./interface";
import uuid = require("uuid");
var API = require("@jingli/dnode-api");
import getAllPrefer from "./getAllPrefer";
import computeBudget from "./computeBudget";
const cache = require("common/cache");
let request = require("request-promise");
import { verifySign, genSign } from '@jingli/sign';
import { conf, auth } from 'server-auth';
import config = require("@jingli/config");



export interface GetBudgetParams extends CreateBudgetParams {
    [index: string]: any;               //qmtrip 回传的其它信息
}

export class Budget {
    async getBudget(params: GetBudgetParams) {
        let { callbackUrl, requestBudgetParams, companyId, travelPolicyId, staffs } = params;

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
        } as BudgetOrder;

        /* perfect the dataOrders. */
        for (let segment of segments) {
            segment.channels = [];
            segment.step = STEP.CACHE;     //预期数据类型
            segment.data = [];
            budgetOrder.budgetData.push(segment);
        }

        /* request data-store */
        let ps = budgetOrder.budgetData.map(async (item: DataOrder, index) => {
            //全价数据获取，如果出错直接抛出
            let dataStore = API.getData.search_data(item);
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
        };
        budgetOrder.step = STEP.FINAL;
        for (let item of budgetOrder.budgetData) {
            if (item.step != STEP.FINAL) {
                budgetOrder.step = STEP.CACHE;
            }
            finallyResult.budgets.push(item.budget);
        }

        if (budgetOrder.step != STEP.FINAL) {
            //10s 后拉取最终预算
            setTimeout(() => {
                this.getFinalBudget(budgetOrder);
            }, 1000 * 5);
        }

        finallyResult.step = budgetOrder.step;
        console.log('**********', budgetOrder);
        console.log("using time : ", Date.now() - times);
        return finallyResult;
    }

    async getFinalBudget(budgetOrder: BudgetOrder, num?: number) {
        num = num ? num : 0;
        let time = Date.now();

        let ps = budgetOrder.budgetData.map(async (item) => {
            if (item.step == STEP.FINAL) {
                return item;
            }

            item.step = STEP.FINAL;  //预期final数据
            let dataStore = await API.getData.search_data(item);
            item.data = dataStore.data;
            item.step = dataStore.step;
            item.channels = dataStore.channels;
            return item;
        });


        budgetOrder.budgetData = await Promise.all(ps);

        /* 整理预算数据输出 */
        let finallyResult = {
            budgets: [],
            step: STEP.FINAL
        };
        //计算打分
        budgetOrder.step = STEP.FINAL;
        for (let item of budgetOrder.budgetData) {
            item.budget = await computeBudget.getBudget(item);
            if (item.step != STEP.FINAL) {
                num++;
                if (num < 4) {
                    console.error("data-store 返回的数据不是全 FIN; 尝试重新拉取 第",num,"次");
                    return await this.getFinalBudget(budgetOrder, num);
                }
            }

            finallyResult.budgets.push(item.budget);
        }

        console.log("finalBudget Time using: ", Date.now() - time);

        await this.sendBudget(finallyResult, budgetOrder.callbackUrl);
    }

    /* 执行发送 5 次逻辑，5次后最终报错 */
    async sendBudget(result: any, callbackUrl: string, num?: number) {
        num = num ? num : 0;
        if (!callbackUrl) {
            return;
        }
        // console.log("sendBudget  sendBudget  ===>", callbackUrl);
        // console.log("sendBudget sendBudget  ",result);

        let timestamp = Math.ceil(Date.now() / 1000);
        let sign = genSign(result, timestamp, config.agent.appSecret);

        try {
            let ret = await request({
                uri: callbackUrl,
                method: "post",
                body: result,
                headers:{
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
}

export let budget = new Budget();




// setTimeout(async () => {
//     console.log("go go");
//     await budget.getBudget({
//         callbackUrl: "12344",
//         "travelPolicyId": "ae6e7050-af2a-11e7-abf6-9f811e5a6ff9",
//         "companyId": "e3e7e690-1b7c-11e7-a571-7fedc950bceb",
//         "staffs": [
//             {
//                 "gender": 1,
//                 "policy": "domestic"
//             }
//         ],
//         originPlace: 'CT_131',
//         goBackPlace: 'CT_131',
//         isRoundTrip: false,
//         destinationPlacesInfo:
//             [{
//                 destinationPlace: 'CT_075',
//                 leaveDate: "2018-01-26T10:00:00.000Z",
//                 goBackDate: "2018-01-27T01:00:00.000Z",
//                 latestArrivalDateTime: "2018-01-26T10:00:00.000Z",
//                 earliestGoBackDateTime: "2018-01-27T01:00:00.000Z",
//                 isNeedTraffic: true,
//                 isNeedHotel: true,
//                 reason: ''
//             },
//                 // {
//                 //     destinationPlace: 'CT_289',
//                 //     leaveDate: "2018-01-27T10:00:00.000Z",
//                 //     goBackDate: "2018-01-28T01:00:00.000Z",
//                 //     latestArrivalDateTime: "2018-01-27T10:00:00.000Z",
//                 //     earliestGoBackDateTime: "2018-01-28T01:00:00.000Z",
//                 //     isNeedTraffic: true,
//                 //     isNeedHotel: true,
//                 //     reason: ''
//                 // },
//                 // {
//                 //     destinationPlace: 'CT_179',
//                 //     leaveDate: "2018-01-28T10:00:00.000Z",
//                 //     goBackDate: "2018-01-29T01:00:00.000Z",
//                 //     latestArrivalDateTime: "2018-01-28T10:00:00.000Z",
//                 //     earliestGoBackDateTime: "2018-01-29T01:00:00.000Z",
//                 //     isNeedTraffic: true,
//                 //     isNeedHotel: true,
//                 //     reason: ''
//                 // }
//             ],
//     })

// }, 8000);