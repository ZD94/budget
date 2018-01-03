/*
 * @Author: Mr.He 
 * @Date: 2017-11-24 17:06:38 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2017-12-26 17:31:58
 * @content analyze the budgets request . */

import * as uuid from "uuid";
// import { ISegment } from "_types/budget";
import { SearchHotelParams, SearchTicketParams, BudgetType, BudgetItemParams, DataOrder } from "./interface";
import { STEP } from 'model/budget';

export interface ISegment {
    destinationPlace?: string;
    leaveDate?: string;
    goBackDate?: string;
    isNeedTraffic?: boolean;   //后期考虑 是否需要传入
    isNeedHotel?: boolean;     //后期考虑 是否需要传入
    businessDistrict?: any;    //商圈            逗号分隔的经纬度， 没有逗号则取城市
    hotelName?: string;        //hotelName 
    reason?: string;
    latestArrivalDateTime?: string;
    earliestGoBackDateTime?: string;
}

export interface CreateBudgetParams {
    expectStep?: STEP;
    originPlace?: string;
    isRoundTrip?: boolean;             //是否为往返
    goBackPlace?: string;              //返回地
    destinationPlacesInfo: ISegment[];
}

/* 分析请求参数 */
export function analyzeBudgetParams(params: CreateBudgetParams): BudgetItemParams[] | DataOrder[] {

    let budgetParams = [];

    let destinations = params.destinationPlacesInfo;

    //deal traffic budget params. 不处理最后返程
    destinations.map((destination, index) => {
        if (destination.isNeedTraffic) {
            if (index == 0 && params.originPlace) {
                //第一段，看是否需要去程交通
                let trip = {
                    id: uuid.v1(),
                    type: BudgetType.TRAFFICT,
                    input: {
                        leaveDate: destination.latestArrivalDateTime, //第一程的出发时间可优化
                        originPlace: params.originPlace,
                        destination: destination.destinationPlace,
                        earliestGoBackDateTime: destination.earliestGoBackDateTime,
                        latestArrivalDateTime: destination.latestArrivalDateTime
                    },
                    index
                };
                budgetParams.push(trip);
            }

            if (index != 0) {
                let trip = {
                    id: uuid.v1(),
                    type: BudgetType.TRAFFICT,
                    input: {
                        leaveDate: destinations[index - 1].earliestGoBackDateTime,
                        originPlace: destinations[index - 1].destinationPlace,
                        destination: destination.destinationPlace,
                        earliestGoBackDateTime: destination.earliestGoBackDateTime,
                        latestArrivalDateTime: destination.latestArrivalDateTime
                    },
                    index
                };
                budgetParams.push(trip);
            }
        }

        if (destination.isNeedHotel) {
            let hotelTrip = {
                id: uuid.v1(),
                type: BudgetType.HOTEL,
                input: {
                    checkInDate: destination.latestArrivalDateTime,
                    checkOutDate: destination.earliestGoBackDateTime,
                    city: destination.destinationPlace,
                    // location: {   //后期加入对商圈的处理
                    //     latitude:"",
                    //     longitude:""
                    // }
                },
                index
            };
            budgetParams.push(hotelTrip);
        }
    });

    /* 处理最后返程 */
    if (params.goBackPlace && params.isRoundTrip) {
        let trip = {
            id: uuid.v1(),
            type: BudgetType.TRAFFICT,
            input: {
                leaveDate: destinations[destinations.length - 1].latestArrivalDateTime,
                originPlace: destinations[destinations.length - 1].destinationPlace,
                destination: params.goBackPlace,
                earliestGoBackDateTime: destinations[destinations.length - 1].earliestGoBackDateTime,
                latestArrivalDateTime: destinations[destinations.length - 1].latestArrivalDateTime
            },
            index: destinations.length
        };
        budgetParams.push(trip);
    }

    return budgetParams;
}