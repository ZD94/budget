/*
 * @Author: Mr.He 
 * @Date: 2017-12-20 18:56:43 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-03-09 11:01:44
 * @content what is the content of this file. */

export * from "./interface";
export * from "./strategy";

import { analyzeBudgetParams } from "./analyzeParams";
import { STEP, BudgetOrder, DataOrder, BudgetType, SearchHotelParams, SearchTicketParams, SearchSubsidyParams, BudgetFinallyResult, GetBudgetParams } from "./interface";
import uuid = require("uuid");
var API = require("@jingli/dnode-api");
if (API.default) {
    API = API.default
}
import restfulAPIUtil from 'api/restful/index'

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
import * as _ from "lodash";

// test
// import "test/api/budget.test";

export class Budget extends BudgetHelps {
    constructor() {
        super();
    }
    async getBudget(params: GetBudgetParams): Promise<BudgetFinallyResult> {
        let {
            callbackUrl,
            companyId,
            travelPolicyId,
            staffs,
            currency = config.defaultCurrency,
            expectStep = STEP.CACHE
        } = params;

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


        /* request data-store, 获取打分项，打分 */
        let ps = budgetOrder.budgetData.map(async (item: DataOrder, index) => {
            //获取补助，之后获取
            if (item.type == 3) {
                let input = item.input as SearchSubsidyParams;
                item.budget = await getSubsidy.getSubsidyItem(companyId, travelPolicyId, input, budgetOrder.persons);
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
                input: item.input,
                backOrGo: item.backOrGo
            });

            let ps = await Promise.all([await dataStore, await prefer]);
            item.data = ps[0].data;
            item.step = ps[0].step;
            item.channels = ps[0].channels;
            item.prefer = ps[1];
            //进行打分，得出最终预算
            item.budget = await computeBudget.getBudget(item, budgetOrder.persons);
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
        this.setWebTrackEndPoint({
            "__topic__":config.serverType,
            "project":"jlbudget",
            "eventName":"HttpRequest-FirstBudgetResult",
            "result":JSON.stringify(finallyResult),
            "step":finallyResult.step,
            "persons":`${finallyResult.persons}`,
            "operationStatus": finallyResult.budgets.length ? 'SUCCESS' : 'FAIL'
        });
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
                item.budget = await computeBudget.getBudget(item, budgetOrder.persons);
            } else {
                let input = item.input as SearchSubsidyParams;
                item.budget = await getSubsidy.getSubsidyItem(budgetOrder.companyId, budgetOrder.travelPolicyId, input, budgetOrder.persons);
            }
            finallyResult.budgets.push(this.completeBudget(item, budgetOrder));
        }

        console.log("finalBudget Time using: ", Date.now() - time);
        let budgetItem = await Models.budget.get(budgetOrder.id);
        if (budgetItem) {
            budgetItem.resultFinally = finallyResult;
            await budgetItem.save();
        }
        this.setWebTrackEndPoint({
            "__topic__":config.serverType,
            "project":'jlbudget',
            "eventName":"HttpRequest-FinallyDateResult",
            "result":JSON.stringify(finallyResult.budgets),
            "step":finallyResult.step,
            "persons":`${finallyResult.persons}`,
            "operationStatus": finallyResult.budgets.length ? 'SUCCESS' : 'FAIL'
        })
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
            num++;
            console.error("事件推送失败, 次数：", num);
            console.error(e.message || e);
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

    compare(obj1, obj2) {
        let val1 = obj1.price;
        let val2 = obj2.price;
        if (val1 < val2) {
            return 1
        } else if (val1 > val2) {
            return -1
        } else {
            return 0
        }
    }

    /* 处理汇率 */
    completeBudget(item: DataOrder, budgetOrder: BudgetOrder) {
        let budget = item.budget;
        budget.index = item.index;
        budget.backOrGo = item.backOrGo;
        //处理人数，汇率
        budget.price = Math.floor(budget.price * budgetOrder.rate * 100) / 100;
        budget.unit = budgetOrder.currency;
        budget.rate = budgetOrder.rate;
        if (item.type == BudgetType.TRAFFICT) {
            budget.leaveDate = (item.input as SearchTicketParams).leaveDate;
        }
        if (item.type != BudgetType.SUBSIDY) {
            let data = _.cloneDeep(budget.markedScoreData);
            data = data && data.length ? data: [];
            for (let item of data){
                item.price ? item.price = Number(item.price) : item.price = 0
            }
            let scoreDataSortByPrice = data.sort(this.compare);
            budget.highestPrice = scoreDataSortByPrice && scoreDataSortByPrice.length? 
                scoreDataSortByPrice[0].price * budgetOrder.persons: 0;
        }
        delete budget.prefers;
        delete budget.markedScoreData;
        return budget;
    }

    /* 如果没有拉取到数据，并且期望请求是cache，立即请求FIN数据 */
    async requestDataStore(params: DataOrder) {
        let dataStoreParams = _.cloneDeep(params);
        dataStoreParams.data = [];
        try {
            let result: DataOrder = await request({
                uri: config.dataStore + "/searchData",
                method: "post",
                body: dataStoreParams,
                json: true
            });

            if (params.step == STEP.CACHE && !result.data.length) {
                let theParams = _.clone(dataStoreParams);
                theParams.step = STEP.FINAL;

                return await request({
                    uri: config.dataStore + "/searchData",
                    method: "post",
                    body: theParams,
                    json: true
                });
            } else {
                return result;
            }
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

    async setWebTrackEndPoint(params){
        let qs = {
            "APIVersion": '0.6.0',
        };
        for (let key in params){
            qs[key] = params[key]
        }
        try{
            let result = await restfulAPIUtil.proxyHttp({
                uri: config.aliWebTrackUrl,
                qs
            })
        }catch (err){
            console.log(err);
            return
        }

    }
}
let budget = new Budget();
export default budget;