/*
 * @Author: Mr.He 
 * @Date: 2017-12-20 18:56:43 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-02-06 22:07:57
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
import { getRate } from "model/rate";

// test
import "test/api/budget.test";

export class Budget extends BudgetHelps {
    constructor() {
        super();
    }
    async getBudget(params: GetBudgetParams): Promise<BudgetFinallyResult> {
        let { callbackUrl, companyId, travelPolicyId, staffs, currency = config.defaultCurrency, expectStep = STEP.CACHE } = params;

        console.log('params ===========>', params);
        let times = Date.now();
        let persons = staffs.length;   //预算人数

        /* create budget order */
        let budgetOrder = {
            id: uuid.v1(),
            companyId,
            travelPolicyId,
            step: expectStep,
            callbackUrl,
            originParams: params,
            persons,
            currency,
            rate: await getRate(currency),
            budgetData: []
        } as BudgetOrder;


        budgetOrder = await analyzeBudgetParams(budgetOrder);
        console.log("预算请求参数分析： ", budgetOrder.budgetData);


        /* request data-store */
        let ps = budgetOrder.budgetData.map(async (item: DataOrder, index) => {
            //获取补助，之后获取
            if (item.type == 3) {
                let input = item.input as SearchSubsidyParams;
                item.budget = await getSubsidy.getSubsidyItem(companyId, travelPolicyId, input);
                if (!item.budget) {
                    return null;
                }
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
        budgetOrder.budgetData = budgetOrder.budgetData.filter((item) => item);

        /* 整理预算数据输出 */
        let finallyResult = {
            budgets: [],
            step: STEP.FINAL,
            persons: budgetOrder.persons,
            currency: budgetOrder.currency,
            rate: budgetOrder.rate
        } as BudgetFinallyResult;
        budgetOrder.step = STEP.FINAL;
        for (let item of budgetOrder.budgetData) {
            finallyResult.budgets.push(this.completeBudget(item, budgetOrder));
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
            query: budgetOrder.originParams,
            result: finallyResult
        });
        await budgetItem.save();
        return finallyResult;
    }

    async getFinalBudget(id, num?: number) {
        num = num ? num : 0;
        let { budgetOrder, finallyResult: result } = await cache.read(id);
        budgetOrder as BudgetOrder;
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
                console.error(e.message || e);
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
            budgetOrder.budgetData = result;
            console.log(e);
        }

        /* 整理预算数据输出 */
        let finallyResult = {
            budgets: [],
            step: STEP.FINAL,
            persons: budgetOrder.persons,
            currency: budgetOrder.currency,
            rate: budgetOrder.rate
        } as BudgetFinallyResult;
        //计算打分
        budgetOrder.step = STEP.FINAL;
        for (let item of budgetOrder.budgetData) {
            if (item.type != BudgetType.SUBSIDY) {
                item.budget = await computeBudget.getBudget(item);
            } else {
                let input = item.input as SearchSubsidyParams;
                item.budget = await getSubsidy.getSubsidyItem(budgetOrder.companyId, budgetOrder.travelPolicyId, input);
            }
            finallyResult.budgets.push(this.completeBudget(item, budgetOrder));
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

    completeBudget(item: DataOrder, budgetOrder: BudgetOrder) {
        let budget = item.budget;
        budget.index = item.index;
        budget.backOrGo = item.backOrGo;
        //处理人数，汇率
        budget.price = Math.floor(budget.price * budgetOrder.persons * budgetOrder.rate * 100) / 100;
        budget.unit = budgetOrder.currency;
        budget.rate = budgetOrder.rate;
        if (item.type == BudgetType.TRAFFICT) {
            budget.leaveDate = (item.input as SearchTicketParams).leaveDate;
        }
        delete budget.prefers;
        delete budget.markedScoreData;
        return budget;
    }

    async requestDataStore(params: any) {
        /* 服务稳定后，应当对请求错误执行重复拉取 */
        try {
            return await request({
                uri: config.dataStore + "/searchData",
                method: "post",
                body: params,
                json: true
            });
        } catch (e) {
            console.error("requestDataStore error. The params : ", {
                uri: config.dataStore + "/searchData",
                method: "post",
                body: params,
                json: true
            });
            throw new Error(e.message || e);
        }
    }
}

export let budget = new Budget();