/*
 * @Author: Mr.He 
 * @Date: 2017-12-16 18:01:07 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2017-12-17 02:58:58
 * @content what is the content of this file. */

const cache = require("common/cache");
let request = require("request-promise");
import API from '@jingli/dnode-api';
var ApiTravelBudget = require("api/budget/index");



export enum STEP {
    ONE = "FULL",
    TWO = "CACHE",
    FINAL = "FIN"
}

export interface BudgetDataItem {
    id: string;
    data: any[];
    step: STEP
}

export interface BudgetOrder {
    [index: string]: any;
    id: string;                 //BudgetOrder标示
    step: STEP;
    budget: BudgetDataItem[];              //保存data-store拉取数据
    callbackUrl: string;        //回调地址
    createBudgetParam: any;     //预算请求参数
}

export interface DataOrder {
    id: string;   //这份数据的id
    orderId: string;
    channels: any,
    param: any,
    step: STEP,
    data: any[]
}


export class DataEvent {
    /*  */
    async dealDataEvent(pushData: DataOrder) {
        //更新cache数据
        let budgetOrder = await cache.read(pushData.orderId) as BudgetOrder;
        if (!budgetOrder) {
            return;
        }
        for (let budget of budgetOrder.budget) {
            if (budget.id == pushData.id) {
                budget.data = pushData.data;
                budget.step = pushData.step;
                break;
            }
        }

        //检查当前几份数据的状态
        let FIN = true;
        for (let budget of budgetOrder.budget) {
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
        console.log("dealDataEvent================================>", budgetOrder);
        await this.sendData(budgetOrder);
    }

    /*  */
    async addBudgetOrderCache(params: BudgetOrder) {
        await cache.write(params.id, params);
    }

    /* 获取一个预算详情 */
    async getOneBudget(orderId: string, itemId: string) {
        console.log("getOneBudget====>", orderId);
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
        let theBudget: BudgetDataItem;
        for (let budget of order.budget) {
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
                step: STEP.ONE
            }
            order.budget.push(theBudget);
        }

        await cache.write(orderId, order);
    }


    async sendData(params: BudgetOrder) {
        // console.log("sendData sendData sendData", params.createBudgetParam)
        let result = await API['budget'].createBudget(params.createBudgetParam);
        result.step = params.step;

        console.log("sendData sendData sendData finally.", result);
        console.log("okkkkkk====>", params);
        for (let i = 0; i < 5; i++) {
            console.log("================ send Data. Over  ===============")
        }
        try {
            await request({
                uri: params.callbackUrl,
                method: "post",
                body: result,
                json: true
            });
        } catch (e) {
            console.error(e);
        }
    }
}

export let dataEvent = new DataEvent();