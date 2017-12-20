/*
 * @Author: Mr.He 
 * @Date: 2017-11-24 17:06:38 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2017-12-20 18:44:18
 * @content analyze the budgets request . */

import * as uuid from "uuid";
// import { ISegment } from "_types/budget";

export interface ISegment {
    destinationPlace?: string;
    leaveDate?: string;
    goBackDate?: string;
    isNeedTraffic?: boolean;   //后期考虑 是否需要传入
    isNeedHotel?: boolean;     //后期考虑 是否需要传入
    businessDistrict?: any;    //商圈
    hotelName?: string;        //hotelName 
    reason?: string;
    latestArrivalDateTime?: string;
    earliestGoBackDateTime?: string;
}

export interface CreateBudgetParams {
    originPlace?: string;
    isRoundTrip?: boolean;             //是否为往返
    goBackPlace?: string;              //返回地
    destinationPlacesInfo: ISegment[];
}

export enum BudgetType {
    HOTEL = "hotel",
    TRAFFICT = "traffic"
}

/* 预算请求参数 */
export interface BudgetParams {
    id: string;  //每段预算唯一标示
    type: BudgetType;
    index: number;
    beginTime: Date;
    endTime?: Date;
    fromCity?: string;
    arrivalCity: string;
    businessDistrict?: {
        longitude: number,
        latitude: number
    };
}

/* finally Result */
export interface BudgetResults {
    id: string;  //预算订单id
    originParam: CreateBudgetParams;  //预算请求原始参数
    budgets: BudgetParams[];
}

/* 分析请求参数 */
export function analyzeBudgetParams(params: CreateBudgetParams): BudgetResults {

    let result = {
        id: uuid.v1(),
        budgets: [],
        originParam: params
    }

    let destinations = params.destinationPlacesInfo;

    //deal traffic budget params. 不处理最后返程
    destinations.map((destination, index) => {
        if (destination.isNeedTraffic) {
            if (index == 0 && params.originPlace) {
                //第一段，看是否需要去程交通
                let trip = {
                    id: uuid.v1(),
                    type: BudgetType.TRAFFICT,
                    beginTime: destination.latestArrivalDateTime, //第一程的出发时间可优化
                    fromCity: params.originPlace,
                    arrivalCity: destination.destinationPlace,
                    index
                };
                result.budgets.push(trip);
            }

            if (index != 0) {
                let trip = {
                    id: uuid.v1(),
                    type: BudgetType.TRAFFICT,
                    beginTime: destinations[index - 1].earliestGoBackDateTime,
                    fromCity: destinations[index - 1].destinationPlace,
                    arrivalCity: destination.destinationPlace,
                    index
                };
                result.budgets.push(trip);
            }
        }

        if (destination.isNeedHotel) {
            let hotelTrip = {
                id: uuid.v1(),
                type: BudgetType.HOTEL,
                beginTime: destination.latestArrivalDateTime,
                endTime: destination.earliestGoBackDateTime,
                arrivalCity: destination.destinationPlace,
                businessDistrict: destination.businessDistrict || null,    //后期加入对商圈的处理
                index
            };
            result.budgets.push(hotelTrip);
        }
    });

    /* 处理最后返程 */
    if (params.goBackPlace && params.isRoundTrip) {
        let trip = {
            id: uuid.v1(),
            type: BudgetType.TRAFFICT,
            beginTime: destinations[destinations.length - 1].earliestGoBackDateTime,
            fromCity: destinations[destinations.length - 1].destinationPlace,
            arrivalCity: params.goBackPlace,
            index: destinations.length
        };
        result.budgets.push(trip);
    }

    return result;
}