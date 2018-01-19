/*
 * @Author: Mr.He 
 * @Date: 2017-11-24 17:06:38 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-01-19 16:38:39
 * @content analyze the budgets request . */

import * as uuid from "uuid";
import { SearchHotelParams, SearchTicketParams, BudgetType, BudgetItemParams, DataOrder } from "./interface";
import { STEP } from 'model/budget';
import moment = require("moment");

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


    destinations.map((destination, index) => {
        /* deal traffic budget params. 不处理最后返程 */
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

        /* ================================= 住宿参数 =================================== */
        if (destination.isNeedHotel) {
            let nextDestination = destinations[index + 1];
            if (nextDestination) {
                let beginDate = moment(destination.leaveDate).format("YYYY-MM-DD");
                let nextBeginDate = moment(nextDestination.leaveDate).format("YYYY-MM-DD");
                if (beginDate < nextBeginDate) {
                    //符合实际条件，添加住宿项
                    budgetParams.push(createHotel(destination.leaveDate, destination.goBackDate, destination.destinationPlace, index));
                }
            } else {
                let beginDate = moment(destination.leaveDate).format("YYYY-MM-DD");
                let endDate = moment(destination.goBackDate).format("YYYY-MM-DD");
                if (beginDate < endDate) {
                    //符合实际条件，添加住宿项
                    budgetParams.push(createHotel(destination.leaveDate, destination.goBackDate, destination.destinationPlace, index));
                }
            }
        }

        /* =================================== 添加补助参数 ================================= */
        if (destinations[index + 1]) {
            let nextDestination = destinations[index + 1];
            let beginDate = moment(destination.leaveDate).format("YYYY-MM-DD");
            let nextBeginDate = moment(nextDestination.leaveDate).format("YYYY-MM-DD");
            if (beginDate < nextBeginDate) {
                /* 增加一项补助 */
                budgetParams.push(createSubsidy(destination.leaveDate, destination.goBackDate, destination.destinationPlace, index));
            }
        } else {
            /**
             *  当前最后一程，检查时间与出发日期是否是同一天
             **/
            let firstDestination = destinations[0];
            let tripBeginDate = moment(firstDestination.leaveDate).format("YYYY-MM-DD");
            let beginDate = moment(destination.leaveDate).format("YYYY-MM-DD");
            if (tripBeginDate < beginDate) {
                /* 增加一项补助 */
                budgetParams.push(createSubsidy(destination.leaveDate, destination.goBackDate, destination.destinationPlace, index));
            } else {
                let endDate = moment(destination.goBackDate).format("YYYY-MM-DD");
                if (beginDate < endDate) {
                    /* 不是当天回的情况，增加一项补助 */
                    budgetParams.push(createSubsidy(destination.leaveDate, destination.goBackDate, destination.destinationPlace, index));
                } else if (!params.goBackPlace || !params.isRoundTrip) {
                    /* 当天回的情况，检查是否有返程；没有返程，增加一项补助 */
                    budgetParams.push(createSubsidy(destination.leaveDate, destination.goBackDate, destination.destinationPlace, index, 1));
                }
            }
        }
        /* ==================================== 添加补助参数 ====== END =================== */

    });

    /* 处理最后返程 */
    if (params.goBackPlace && params.isRoundTrip) {
        let lastDestinations = destinations[destinations.length - 1];
        let trip = {
            id: uuid.v1(),
            type: BudgetType.TRAFFICT,
            input: {
                leaveDate: lastDestinations.leaveDate,
                originPlace: lastDestinations.destinationPlace,
                destination: params.goBackPlace,
                earliestGoBackDateTime: lastDestinations.earliestGoBackDateTime,
                latestArrivalDateTime: lastDestinations.latestArrivalDateTime
            },
            index: destinations.length
        };
        budgetParams.push(trip);

        /* 增加一项补助 */
        budgetParams.push(createSubsidy(lastDestinations.leaveDate, lastDestinations.goBackDate, params.goBackPlace, destinations.length, 1));
    }

    return budgetParams;
}

function createSubsidy(beginTime: string, endTime: string, city: string, index: number, days?: number) {
    if (!days) {
        let mBeginTime = moment(moment(beginTime).format("YYYY-MM-DD")),
            mEndTime = moment(moment(endTime).format("YYYY-MM-DD"));
        days = mEndTime.diff(mBeginTime, "days");
    }

    return {
        id: uuid.v1(),
        type: BudgetType.SUBSIDY,
        input: {
            beginTime,
            endTime,
            city,
            days
        },
        index
    };
}

function createHotel(checkInDate: string, checkOutDate: string, city: string, index, location?: any) {
    return {
        id: uuid.v1(),
        type: BudgetType.HOTEL,
        input: {
            checkInDate,
            checkOutDate,
            city,
            location: location || {}
        },
        index
    };
}