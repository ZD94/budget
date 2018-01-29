/*
 * @Author: Mr.He 
 * @Date: 2017-12-20 18:56:43 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-01-29 15:09:17
 * @content what is the content of this file. */

export * from "./interface";
export * from "./strategy";

import { analyzeBudgetParams } from "./analyzeParams";
import { STEP, BudgetOrder, DataOrder, BudgetType, SearchHotelParams, SearchTicketParams, SearchSubsidyParams, BudgetFinallyResult, GetBudgetParams } from "./interface";
import uuid = require("uuid");
var API = require("@jingli/dnode-api");
import getAllPrefer from "./getAllPrefer";
import computeBudget from "./computeBudget";
import getSubsidy from "./getSubsidy";
const cache = require("common/cache");
let request = require("request-promise");
import { verifySign, genSign } from '@jingli/sign';
import { conf, auth } from 'server-auth';
import config = require("@jingli/config");
import { CityService } from "_types/city";
import { Models } from "_types";
import { clearTimeout } from 'timers';
import { BudgetHelps } from "./helper";

// test
// import "test/api/budget.test";

export class Budget extends BudgetHelps {
    constructor() {
        super();
    }
    async getBudget(params: GetBudgetParams): Promise<BudgetFinallyResult> {
        let { callbackUrl, requestBudgetParams, companyId, travelPolicyId, staffs, expectStep = STEP.CACHE } = params;

        console.log('params ===========>', params);
        let times = Date.now();
        //后期考虑 针对不同的用户生成不同的预算
        let persons = staffs.length;   //预算人数
        let segments = analyzeBudgetParams(params) as DataOrder[];
        console.log("预算请求参数分析： ", segments);


        /* create budget order */
        let budgetOrder = {
            id: uuid.v1(),
            budgetData: [],
            callbackUrl,
            params,
            persons
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
            //获取补助，之后获取
            if (item.type == 3) {
                let input = item.input as SearchSubsidyParams;
                item.budget = await getSubsidy.getSubsidyItem(companyId,
                    travelPolicyId, input);
                return item;
            }

            //数据获取，如果出错直接抛出
            let dataStore = this.requestDataStore(item);
            //获取prefer
            let prefer = getAllPrefer.getPrefer({
                companyId,
                travelPolicyId,
                type: item.type,
                input: item.input
            });

            let ps = await Promise.all([await dataStore, await prefer]);
            item.data = ps[0].data;
            item.step = ps[0].step;
            item.channels = ps[0].channels;
            item.prefer = ps[1];
            //进行打分，得出最终预算
            item.budget = await computeBudget.getBudget(item);
            return item;
        });

        budgetOrder.budgetData = await Promise.all(ps);

        /* 整理预算数据输出 */
        let finallyResult = {
            budgets: [],
            step: STEP.FINAL,
            persons: budgetOrder.persons
        } as BudgetFinallyResult;
        budgetOrder.step = STEP.FINAL;
        for (let item of budgetOrder.budgetData) {
            finallyResult.budgets.push(this.completeBudget(item, budgetOrder.persons));
            if (item.step != STEP.FINAL) {
                budgetOrder.step = STEP.CACHE;
            }
        }

        if (budgetOrder.step != STEP.FINAL) {
            await cache.write(budgetOrder.id, { budgetOrder, finallyResult }, 5 * 60);
            //10s 后拉取最终预算
            this.getFinalBudget(budgetOrder.id);
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

    async getFinalBudget(id, num?: number) {
        num = num ? num : 0;
        let { budgetOrder, finallyResult: result } = await cache.read(id);
        let time = Date.now();
        let ps = budgetOrder.budgetData.map(async (item) => {
            if (item.step == STEP.FINAL || item.type == BudgetType.SUBSIDY) {
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
                // console.error(e);
            }

            return item;
        });

        try {
            budgetOrder.budgetData = await function () {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject("DataStore FIN data, request Time out!");
                    }, 1.5 * 60 * 1000);
                    Promise.all(ps).then((result) => {
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
            step: STEP.FINAL,
            persons: budgetOrder.persons
        } as BudgetFinallyResult;
        //计算打分
        budgetOrder.step = STEP.FINAL;
        for (let item of budgetOrder.budgetData) {
            if (item.type != BudgetType.SUBSIDY) {
                item.budget = await computeBudget.getBudget(item);
            }
            finallyResult.budgets.push(this.completeBudget(item, budgetOrder.persons));
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
        console.log("sendBudget sendBudget ************************************** ", num, "    ", result);
        if (!callbackUrl) {
            return;
        }

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
            if (num >= 2) {
                console.error("*****", num, " 次后还是失败。事件推送失败!");
                return;
            } else {
                setTimeout(async () => {
                    this.sendBudget(result, callbackUrl, num);
                }, num * 1000);
            }
        }
    }

    completeBudget(item: DataOrder, persons: number = 1) {
        let budget = item.budget;
        budget.index = item.index;
        budget.backOrGo = item.backOrGo;
        budget.price = budget.price * persons;
        delete budget.prefers;
        delete budget.markedScoreData;
        return budget;
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