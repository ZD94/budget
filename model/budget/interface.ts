/*
 * @Author: Mr.He 
 * @Date: 2017-12-21 17:09:03 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-02-06 18:40:19
 * @content 预算相关接口定义 */



import { Budget } from '_types/budget';
import { ICity } from '_types/city';
import { Currency } from '_types/currency/currency';
import config = require("@jingli/config");
export let defaultCurrencyUnit = config.defaultCurrency;

export interface SearchHotelParams {
    checkInDate: string;
    checkOutDate: string;
    city: string;
    selectAddress?: {                       //用户选择的地标
        selectName: string;
        latitude: number;
        longitude: number;
    };
    latitude?: number,
    longitude?: number,
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
    companyId: string,
    travelPolicyId: string,
    callbackUrl: string;        //回调地址
    step: STEP;
    originParams: GetBudgetParams;          //预算请求原始参数
    budgetData: DataOrder[];    //保存data-store拉取数据, 及相关请求参数
    persons: number;            //预算人数
    currency: string;           //币种
    rate: number;               //汇率
}


/* ============ 预算请求参数 ============== */
export interface GetBudgetParams extends CreateBudgetParams {
    [index: string]: any;               //qmtrip 回传的其它信息
}

export interface CreateBudgetParams {
    expectStep?: STEP;
    originPlace?: string;
    isRoundTrip?: boolean;             //是否为往返
    goBackPlace?: string;              //返回地
    destinationPlacesInfo: ISegment[];
}

export interface ISegment {
    destinationPlace?: string;
    leaveDate?: string;
    goBackDate?: string;
    isNeedTraffic?: boolean;   //后期考虑 是否需要传入
    isNeedHotel?: boolean;     //后期考虑 是否需要传入
    businessDistrict?: any;    //商圈            逗号分隔的经纬度， 没有逗号则取城市
    hotelName?: string;        //用户选择的地标名称
    reason?: string;
    latestArrivalDateTime?: string;
    earliestGoBackDateTime?: string;
}

/* ============ 预算请求参数 ===== END ========= */

/* 预算返回结果 */
export interface BudgetFinallyResult {
    step: STEP;
    budgets: any[];
    persons: number;
    currency: string;   //币种
    rate: number;       //汇率
}