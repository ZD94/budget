/*
 * @Author: Mr.He 
 * @Date: 2017-12-21 17:09:03 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-02-05 18:35:15
 * @content 预算相关接口定义 */



import { CreateBudgetParams, analyzeBudgetParams } from "./analyzeParams";
import { Budget } from '_types/budget';
import { ICity } from '_types/city';
import { Currency } from '_types/currency/currency';
import config = require("@jingli/config");
export let defaultCurrencyUnit = config.defaultCurrency;

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

export interface SearchSubsidyParams {
    city: string | ICity;
    beginTime: string;
    endTime: string;
    days: number;     //天数
}

export enum BudgetType {
    TRAFFICT = 1,
    HOTEL = 2,
    SUBSIDY = 3
}

/* 去程还是返程 */
export enum TripType {
    GoTrip = 1,
    BackTrip = 2
}

export enum STEP {
    FULL = "FULL",
    CACHE = "CACHE",
    FINAL = "FIN"
}

/* 分析出的预算请求参数 */
export interface BudgetItemParams {
    id: string;
    type: BudgetType;
    backOrGo: TripType;
    input: SearchHotelParams | SearchTicketParams | SearchSubsidyParams;
    index: number;          //标记段与段之间的关系
    days?: number;          //经历天数
}

/* 经由预算参数加工出一个 行程数据对象 */
export interface DataOrder extends BudgetItemParams {
    channels: string[];   //将来可从其它渠道注入
    step: STEP;
    data: any[];          //dataStore 返回数据
    budget: any;          //这一项的预算
    prefer: any;          //打分使用的prefer项
}

/* 预算订单对象 */
export interface BudgetOrder {
    id: string;                 //BudgetOrder标示
    step: STEP;
    budgetData: DataOrder[];              //保存data-store拉取数据
    callbackUrl: string;        //回调地址
    params: GetBudgetParams;    //请求参数
    persons: number;            //预算人数
    currency: string;           //币种
    rate: number;               //汇率
}

/* 预算请求参数 */
export interface GetBudgetParams extends CreateBudgetParams {
    [index: string]: any;               //qmtrip 回传的其它信息
}

/* 预算返回结果 */
export interface BudgetFinallyResult {
    step: STEP;
    budgets: any[];
    persons: number;
    currency: string;   //币种
    rate: number;       //汇率
}