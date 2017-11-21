/**
 * Created by wlh on 2017/8/29.
 */

'use strict';

import {AbstractController, Restful} from "@jingli/restful";
import {Models} from "_types";

import API from '@jingli/dnode-api';

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
    for(let key in obj) {
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
    staffs = staffs.map( (staff) => {
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

    async get(req, res, next) {
        let {id} = req.params;
        let segmentBudgets = await API['budget'].getBudgetCache({id: id});
        let budgets = segmentBudgets.budgets;
        budgets = this.transformBudgets(budgets);
        segmentBudgets.budgets = budgets;
        res.json(this.reply(0, segmentBudgets));
    }

    async add(req, res, next) {
        req.clearTimeout();
        // let {staffs, policies, fromCity, segments, ret} = req.json;
        //改restful budget api为传travelPolicyId, 同时添加请求货币类型
        let {staffs, fromCity, segments, ret, travelPolicyId, preferedCurrency} = req.body;

        if(preferedCurrency && typeof(preferedCurrency) != 'undefined') {
            let currencyIds = await Models.currency.find({where: {$or: [{currency_code: preferedCurrency}, {currency_name: preferedCurrency}]}});
            if(!currencyIds || !currencyIds.length) {
                return res.json(this.reply(400, []));
            }
        }
        if (!staffs) {
            staffs = []
        }
        if (!staffs.length) {
            return res.json(this.reply(500, []));
        }

        //转换员工
        staffs = transformStaffStrArgsToEnum(staffs);
        //转换差旅标准
        // policies = transformPolicyStrArgsToEnum(policies);
        let segmentBudgets;
        segmentBudgets = await API['budget'].createBudget({
            // policies: policies,
            preferedCurrency: preferedCurrency,
            travelPolicyId: travelPolicyId,
            prefers: [],
            staffs: staffs,
            fromCity,
            ret,
            segments,
        });
        let budgets = segmentBudgets.budgets;
        // budgets = this.transformBudgets(budgets);
        segmentBudgets.budgets = budgets;
        res.json(this.reply(0, segmentBudgets));
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
                return budget;
            });
            hotelBudget = hotelBudget.map((budget) => {
                budget.star = enumToStr(HOTEL_START, budget.star) || budget.star;
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
    for(let key in policies) {
        let policy = policies[key];
        if (!policy.trainSeat) {
            policy.trainSeat = [];
        }
        if (typeof policy.trainSeat == 'string') {
            policy.trainSeat = [policy.trainSeat]
        }
        policy.trainSeat = policy.trainSeat.map( (trainSeat) => {
            return TRAIN_SEAT[trainSeat];
        });

        if (!policy.cabin) {
            policy.cabin = []
        }
        if (typeof policy.cabin == 'string') {
            policy.cabin = [policy.cabin];
        }
        policy.cabin = policy.cabin.map( (cabin) => {
            return CABIN[cabin];
        });

        if (!policy.hotelStar) {
            policy.hotelStar = [];
        }
        if (typeof policy.hotelStar == 'string') {
            policy.hotelStar = [policy.hotelStar];
        }
        policy.hotelStar = policy.hotelStar.map( (hotelStar) => {
            return HOTEL_START[hotelStar];
        })
        policies[key] = policy;
    }
    return policies;
}

