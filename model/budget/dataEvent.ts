/*
 * @Author: Mr.He 
 * @Date: 2017-12-16 18:01:07 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2017-12-22 17:13:25
 * @content what is the content of this file. */

const cache = require("common/cache");
let request = require("request-promise");
import API from '@jingli/dnode-api';
import { DataOrder, BudgetOrder, STEP } from "./interface";

export class DataEvent {
    /* 接收数据推送事件 */
    async dealDataEvent(pushData: DataOrder) {
        //更新cache数据
        let budgetOrder = await cache.read(pushData.orderId) as BudgetOrder;
        if (!budgetOrder) {
            return;
        }
        for (let budget of budgetOrder.budgetData) {
            if (budget.id == pushData.id) {
                budget.data = pushData.data;
                budget.step = pushData.step;
                break;
            }
        }

        //检查当前几份数据的状态
        let FIN = true;
        for (let budget of budgetOrder.budgetData) {
            if (budget.step != STEP.FINAL) {
                FIN = false;
                break;
            }
        }

        if (FIN) {
            budgetOrder.step = STEP.FINAL;
        } else {
            budgetOrder.step = STEP.TWO;
        }
        await cache.write(budgetOrder.id, budgetOrder);
        // console.log("dealDataEvent=====>", budgetOrder);
        await this.sendData(budgetOrder);
    }

    /* 强制发送FIN */
    async forceFIN(orderId: string) {
        let budgetOrder = await cache.read(orderId) as BudgetOrder;
        if (!budgetOrder) {
            return;
        }

        budgetOrder.step = STEP.FINAL;
        await this.sendData(budgetOrder);

        //delete the order
        await cache.remove(orderId);
    }

    async addBudgetOrderCache(params: BudgetOrder) {
        await cache.write(params.id, params);
    }

    /* 获取一个预算详情 */
    async getOneBudget(orderId: string, itemId: string) {
        // console.log("getOneBudget====>", orderId);
        let order = await cache.read(orderId) as BudgetOrder;
        if (!order) {
            throw new Error("Budget order get worry.");
        }

        for (let budget of order.budget) {
            if (budget.id == itemId) {
                return budget;
            }
        }
        return null;
    }

    /* push one budget item into the cache. */
    async pushOneBudget(orderId: string, itemId: string, data?: any) {
        let order = await cache.read(orderId) as BudgetOrder;
        if (!order) {
            throw new Error("Budget order get worry.");
        }
        let theBudget;
        for (let budget of order.budgetData) {
            if (budget.id == itemId) {
                theBudget = budget;
            }
        }

        if (theBudget) {
            theBudget.data = data || [];
        } else {
            theBudget = {
                id: itemId,
                data: [],
                step: STEP.CACHE
            }
            order.budgetData.push(theBudget);
        }

        await cache.write(orderId, order);
    }


    async sendData(params: BudgetOrder) {
        // console.log("sendData sendData sendData", params.createBudgetParam)

        if (!params.callbackUrl) {
            if (params.step == STEP.FINAL) {
                // console.log("delete the order ", params.id);
                await cache.remove(params.id);
            }
            return;
        }

        let result = await API['budget'].createBudget(params.createBudgetParam);
        result.step = params.step;

        // console.log("sendData sendData sendData finally.", result);
        // console.log("okkkkkk====>", params);
        try {
            // await recordedData(result);
            let ret = await request({
                uri: params.callbackUrl,
                method: "post",
                body: result,
                json: true
            });
            console.info("事件推送返回值", ret);
            if (result.step == STEP.FINAL) {
                console.log("budgetOrder remove : ", params.id);
                // await cache.remove(params.id);  不要删除cache
            }
        } catch (e) {
            console.error(e);
        }
    }

    /* 执行发送 5 次逻辑，5次后最终报错 */
    async sendBudget(params: BudgetOrder) {

    }
}

export let dataEvent = new DataEvent();
