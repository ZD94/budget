/*
 * @Author: Mr.He 
 * @Date: 2017-11-24 17:06:38 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-02-06 19:34:40
 * @content analyze the budgets request . */

import * as uuid from "uuid";
import { SearchHotelParams, SearchTicketParams, BudgetType, TripType, BudgetItemParams, DataOrder, BudgetOrder, STEP } from "./interface";
import moment = require("moment");
import { Models } from '_types';

/* 分析请求参数 */
export async function analyzeBudgetParams(budgetOrder: BudgetOrder): Promise<BudgetOrder> {

    let budgetParams = [];
    let originParams = budgetOrder.originParams;
    let destinations = originParams.destinationPlacesInfo;
    let company = await Models.company.get(budgetOrder.companyId);

    destinations.map((destination, index) => {
        /* deal traffic budget params. 不处理最后返程 */
        if (destination.isNeedTraffic) {
            if (index == 0 && originParams.originPlace) {
                //第一段，看是否需要去程交通
                let trip = {
                    id: uuid.v1(),
                    type: BudgetType.TRAFFICT,
                    input: {
                        leaveDate: destination.latestArrivalDateTime, //第一程的出发时间可优化，理论上应该在此基础上提前一段时间
                        originPlace: originParams.originPlace,
                        destination: destination.destinationPlace,
                        earliestGoBackDateTime: destination.earliestGoBackDateTime,
                        latestArrivalDateTime: destination.latestArrivalDateTime
                    },
                    index,
                    backOrGo: TripType.GoTrip
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
                    index,
                    backOrGo: TripType.GoTrip
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
                    budgetParams.push(createHotel({
                        checkInDate: destination.leaveDate,
                        checkOutDate: destination.goBackDate,
                        city: destination.destinationPlace,
                        index,
                        location: destination.businessDistrict
                    }));
                }
            } else {
                let beginDate = moment(destination.leaveDate).format("YYYY-MM-DD");
                let endDate = moment(destination.goBackDate).format("YYYY-MM-DD");
                if (beginDate < endDate) {
                    //符合实际条件，添加住宿项
                    budgetParams.push(createHotel({
                        checkInDate: destination.leaveDate,
                        checkOutDate: destination.goBackDate,
                        city: destination.destinationPlace,
                        index,
                        location: destination.businessDistrict
                    }));
                }
            }
        }

        if (!company.isOpenSubsidyBudget) {
            return;
        }

        /* =================================== 添加补助参数 ================================= */
        if (destinations[index + 1]) {
            let nextDestination = destinations[index + 1];
            let beginDate = moment(destination.leaveDate).format("YYYY-MM-DD");
            let nextBeginDate = moment(nextDestination.leaveDate).format("YYYY-MM-DD");
            if (beginDate < nextBeginDate) {
                /* 增加一项补助 */
                budgetParams.push(createSubsidy({
                    beginTime: destination.leaveDate,
                    endTime: destination.goBackDate,
                    city: destination.destinationPlace,
                    index
                }));
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
                budgetParams.push(createSubsidy({
                    beginTime: destination.leaveDate,
                    endTime: destination.goBackDate,
                    city: destination.destinationPlace,
                    index
                }));
            } else {
                let endDate = moment(destination.goBackDate).format("YYYY-MM-DD");
                if (beginDate < endDate) {
                    /* 不是当天回的情况，增加一项补助 */
                    budgetParams.push(createSubsidy({
                        beginTime: destination.leaveDate,
                        endTime: destination.goBackDate,
                        city: destination.destinationPlace,
                        index
                    }));
                } else if (!originParams.goBackPlace || !originParams.isRoundTrip) {
                    /* 当天回的情况，检查是否有返程；没有返程，增加一项补助 */
                    budgetParams.push(createSubsidy({
                        beginTime: destination.leaveDate,
                        endTime: destination.goBackDate,
                        city: destination.destinationPlace,
                        index,
                        days: 1
                    }));
                }
            }
        }
        /* ==================================== 添加补助参数 ====== END =================== */
    });

    /* 处理最后返程 */
    if (originParams.goBackPlace && originParams.isRoundTrip) {
        let lastDestinations = destinations[destinations.length - 1];
        let trip = {
            id: uuid.v1(),
            type: BudgetType.TRAFFICT,
            input: {
                leaveDate: lastDestinations.goBackDate,
                originPlace: lastDestinations.destinationPlace,
                destination: originParams.goBackPlace,
                earliestGoBackDateTime: lastDestinations.earliestGoBackDateTime,
                latestArrivalDateTime: lastDestinations.latestArrivalDateTime
            },
            index: destinations.length,
            backOrGo: TripType.BackTrip
        };
        budgetParams.push(trip);

        /* 增加一项补助 */
        if (company.isOpenSubsidyBudget) {
            budgetParams.push(createSubsidy({
                beginTime: lastDestinations.goBackDate,
                endTime: lastDestinations.goBackDate,
                city: originParams.goBackPlace,
                index: destinations.length,
                days: 1,
                backOrGo: TripType.BackTrip
            }));
        }
    }

    /* 分析完参数后，检查预算参数是否正确 */
    checkBudgetParams(budgetParams);

    /* perfect the dataOrders, 拼装DataOrder对象 */
    for (let segment of budgetParams) {
        segment.channels = [];
        segment.step = budgetOrder.step;
        segment.data = [];
        budgetOrder.budgetData.push(segment);
    }

    return budgetOrder;
}

function createSubsidy(params: { beginTime: string, endTime: string, city: string, index: number, days?: number, backOrGo?: TripType }) {
    let { beginTime, endTime, city, index, days, backOrGo = TripType.GoTrip } = params;

    if (!days) {
        let mBeginTime = moment(moment(beginTime).format("YYYY-MM-DD")),
            mEndTime = moment(moment(endTime).format("YYYY-MM-DD"));
        days = mEndTime.diff(mBeginTime, "days");
    }

    return {
        id: uuid.v1(),
        type: BudgetType.SUBSIDY,
        days,
        input: {
            beginTime,
            endTime,
            city,
            days
        },
        index,
        backOrGo
    };
}

function createHotel(params: { checkInDate: string, checkOutDate: string, city: string, index, location?: string, backOrGo?: TripType }) {
    let { checkInDate, checkOutDate, city, index, backOrGo = TripType.GoTrip, location } = params;
    let mBeginTime = moment(moment(checkInDate).format("YYYY-MM-DD")),
        mEndTime = moment(moment(checkOutDate).format("YYYY-MM-DD"));
    let days = mEndTime.diff(mBeginTime, "days");

    let latitude = null, longitude = null;
    if (location) {
        if (location.indexOf(",") > 0) {
            latitude = location.split(",")[0];
            longitude = location.split(",")[1];
        }
    }

    return {
        id: uuid.v1(),
        type: BudgetType.HOTEL,
        input: {
            checkInDate,
            checkOutDate,
            city,
            latitude,
            longitude
        },
        days,
        index,
        backOrGo
    };
}

function checkBudgetParams(params) {
    /* 按照分析条件，检查budgetParams */
    let checkParams = params.filter((item) => item.type != BudgetType.SUBSIDY);
    if (!checkParams.length) {
        throw new Error("没有合适的预算项");
    }
}