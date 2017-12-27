/*
 * @Author: Mr.He 
 * @Date: 2017-12-21 17:09:03 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2017-12-22 17:12:00
 * @content 预算相关接口定义 */

import { ICity, CityService } from '_types/city';
export let defaultCurrencyUnit = 'CNY';

export interface SearchHotelParams {
    checkInDate: string;
    checkOutDate: string;
    city: string;
    location?: {
        latitude: number,
        longitude: number,
    }
}

export interface SearchTicketParams {
    leaveDate: string;
    originPlace: string;
    destination: string;
    earliestGoBackDateTime?: string;    //打分最终会用到
    latestArrivalDateTime?: string;     //打分最终会用到
}

export enum BudgetType {
    TRAFFICT = 1,
    HOTEL = 2
}

export enum STEP {
    FULL = "FULL",
    CACHE = "CACHE",
    FINAL = "FIN"
}

/* export interface BudgetDataItem {
    id: string;
    data: any[];
    step: STEP
} */

/* 分析出的预算请求参数 */
export interface BudgetItemParams {
    id: string;
    type: BudgetType;
    input: SearchHotelParams | SearchTicketParams;
    index: number;          //标记段与段之间的关系
}

/* 经由预算参数加工出一个 行程数据对象 */
export interface DataOrder extends BudgetItemParams {
    channels: string[];   //将来可从其它渠道注入
    step: STEP;
    data: any[];          //dataStore 返回数据
    budget: any;
    prefer: any;             //打分使用的prefer项
}

/* 预算订单 对象 */
export interface BudgetOrder {
    id: string;                 //BudgetOrder标示
    step: STEP;
    budgetData: DataOrder[];              //保存data-store拉取数据
    callbackUrl: string;        //回调地址

    createBudgetParam?: any;    //预算请求参数, 以前API.createBudget参数, delete finally.
}

