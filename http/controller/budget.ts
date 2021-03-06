/**
 * Created by wlh on 2017/8/29.
 */

'use strict';

import { AbstractController, Restful, Router } from "@jingli/restful";
import { Models } from "_types";
import { IRequest, IResponse } from "../index";
import API from '@jingli/dnode-api';
var ApiTravelBudget = require("api/budget/index");
import { ISearchHotelParams, ISearchTicketParams } from "api/budget/index";
import { autoSignReply } from 'http/reply';
import { STEP } from "model/budget";
import budget from "model/budget";
import uuid = require("uuid");

const HOTEL_START = {
    FIVE: 5,
    FOUR: 4,
    THREE: 3,
    SECOND: 2
}
const TRAIN_SEAT = {
    BUSINESS_SEAT: 1,
    FIRST_SEAT: 2,
    SECOND_SEAT: 3,
    PRINCIPAL_SEAT: 4,
    SENIOR_SOFT_SLEEPER: 5,
    SOFT_SLEEPER: 6,
    HARD_SLEEPER: 7,
    SOFT_SEAT: 8,
    HARD_SEAT: 9,
    NO_SEAT: 10,
}

const CABIN = {
    ECONOMY: 2,
    FIRST: 3,
    BUSINESS: 4,
    PREMIUM_ECONOMY: 5,    //高端经济仓
}

const TRAFFIC_TYPE = {
    AIRPLANE: 1,
    TRAIN: 2
}

function enumToStr(obj: any, val: number) {
    let result;
    for (let key in obj) {
        if (obj[key] == val) {
            result = key;
            break;
        }
    }
    return result;
}

const GENDER = {
    FEMALE: 2,
    MALE: 1
}

//处理staffs
function transformStaffStrArgsToEnum(staffs) {
    //处理员工性别
    staffs = staffs.map((staff) => {
        staff.gender = GENDER[staff.gender];
        return staff;
    });
    return staffs;
}


@Restful()
export class BudgetController extends AbstractController {

    constructor() {
        super();
    }

    $isValidId(id: string) {
        return /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(id);
    }

    async add(req: IRequest, res: IResponse, next: Function) {
        req.clearTimeout();
        let result = await budget.getBudget(req.body);
        res.jlReply(this.reply(0, result));
    }

    @Router('/getBudgetItems/:id', 'get')
    async getBudgetItems(req: IRequest, res: IResponse, next: Function) {
        let result = await ApiTravelBudget.getBudgetItems(req.query);
        res.jlReply(this.reply(0, result))
    }


    @Router('/getHotelsData', 'post')
    async getHotelsData(req: IRequest, res: IResponse, next: Function) {
        req.clearTimeout();
        let { checkInDate, checkOutDate, cityId, location } = req.body;
        if (!checkInDate || !checkOutDate || !cityId) {
            return res.jlReply(this.reply(500, null));
        }
        let result = await ApiTravelBudget.getHotelsData({
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            cityId: cityId,
            location: location
        });
        res.jlReply(this.reply(0, result))
    }

    @Router('/getTravelPolicy', 'post')
    async getTravelPolicy(req: IRequest, res: IResponse, next: Function) {
        let { travelPolicyId, destinationId } = req.body;
        if (!travelPolicyId || !destinationId)
            return res.jlReply(this.reply(500, null))
        let result = await ApiTravelBudget.getTravelPolicy(travelPolicyId, destinationId);
        res.jlReply(this.reply(0, result));
    }

    @Router('/getTrafficsData', 'post')
    async getTrafficsData(req: IRequest, res: IResponse, next: Function) {
        req.clearTimeout();
        let { leaveDate, originPlaceId, destinationId } = req.body;
        if (!leaveDate || !originPlaceId || !destinationId)
            return res.jlReply(this.reply(500, null))
        let result = await ApiTravelBudget.getTrafficsData({
            leaveDate: leaveDate,
            originPlaceId: originPlaceId,
            destinationId: destinationId
        });
        res.jlReply(this.reply(0, result))
    }

    private transformBudgets(budgets) {
        if (!budgets) {
            return budgets;
        }
        for (let city in budgets) {
            let segmentBudget = budgets[city];
            let trafficBudget = segmentBudget.traffic;
            let hotelBudget = segmentBudget.hotel;
            if (!trafficBudget) {
                trafficBudget = [];
            }
            if (!hotelBudget) {
                hotelBudget = [];
            }
            trafficBudget = trafficBudget.map((budget) => {
                if (budget.trafficType == 1) {
                    budget.cabin = enumToStr(CABIN, budget.cabin) || budget.cabin;
                } else {
                    budget.cabin = enumToStr(TRAIN_SEAT, budget.cabin) || budget.cabin;
                }
                budget.trafficType = enumToStr(TRAFFIC_TYPE, budget.trafficType) || budget.trafficType;
                delete budget.prefers;
                return budget;
            });
            hotelBudget = hotelBudget.map((budget) => {
                budget.star = enumToStr(HOTEL_START, budget.star) || budget.star;
                delete budget.prefers;
                return budget;
            });
            segmentBudget.traffic = trafficBudget;
            segmentBudget.hotel = hotelBudget;
            budgets[city] = segmentBudget;
        }
        return budgets;
    }
}

//处理差旅政策
function transformPolicyStrArgsToEnum(policies) {
    for (let key in policies) {
        let policy = policies[key];
        if (!policy.trainSeat) {
            policy.trainSeat = [];
        }
        if (typeof policy.trainSeat == 'string') {
            policy.trainSeat = [policy.trainSeat]
        }
        policy.trainSeat = policy.trainSeat.map((trainSeat) => {
            return TRAIN_SEAT[trainSeat];
        });

        if (!policy.cabin) {
            policy.cabin = []
        }
        if (typeof policy.cabin == 'string') {
            policy.cabin = [policy.cabin];
        }
        policy.cabin = policy.cabin.map((cabin) => {
            return CABIN[cabin];
        });

        if (!policy.hotelStar) {
            policy.hotelStar = [];
        }
        if (typeof policy.hotelStar == 'string') {
            policy.hotelStar = [policy.hotelStar];
        }
        policy.hotelStar = policy.hotelStar.map((hotelStar) => {
            return HOTEL_START[hotelStar];
        })
        policies[key] = policy;
    }
    return policies;
}

