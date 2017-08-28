/**
 * Created by wlh on 2017/5/10.
 */

'use strict';

import express = require("express");
const route: any = express();
var API = require("@jingli/dnode-api");
import Logger from "@jingli/logger";
let logger = new Logger("openapi");

import auth = require("./auth");
import commonRes = require("./resp");
import statistic = require("./statistic");
import {getControllers} from "./decorator";

//回复模板中间件
route.use(commonRes);
//认证模块中间件
// route.use(auth);

interface ICity {
    id: string;
    name: string;
}

function httpHandle(fn) {
    return function(req, res, next) {
        let ret = fn(req, res);
        if (ret && ret.then && typeof ret.then == 'function') {
            return ret.catch(next);
        }
    }
}

route.get('/city', statistic('/city'), httpHandle(async function(req, res) {
    let {keyword} = req.query;
    let cities = [];
    if (!keyword) {
        cities = await API.place.queryHotCity({limit: 20});
    } else {
        cities = await API.place.queryCity({keyword: keyword});
    }
    cities = cities.map( (city) => {
        return transformCity(city);
    });
    res['openapiRes'](0, '', { "cities": cities});
}));

var cityMap = new Map<string, ICity>();

route.get('/city/:id', statistic('/city/:id'), httpHandle(async (req, res) => {
    let {id} = req.params;
    let city = cityMap[id];
    if (!city) {
        city = await API.place.getCityInfo({cityCode: id});
    }
    city = transformCity(city);
    res['openapiRes'](0, '', {"cities": [city]});
}));

route.get('/budget/:id', statistic('/budget/:id'), httpHandle(async function(req, res) {
    let {id} = req.params;
    let segmentBudgets = await API.budget.getBudgetCache({id: id});
    let budgets = segmentBudgets.budgets;
    budgets = transformBundgets(budgets);
    segmentBudgets.budgets = budgets;
    res['openapiRes'](0, '', segmentBudgets)
}));

route.post('/budget', statistic('/budget'), httpHandle(async function(req, res) {
    req.clearTimeout();
    let {staffs, policies, fromCity, segments, ret} = req.json;
    
    if (!staffs) {
        staffs = []
    }
    if (!staffs.length) {
        return res['openapiRes'](500, '', {});
    }
    //转换员工
    staffs = transformStaffStrArgsToEnum(staffs);
    //转换差旅标准
    policies = transformPolicyStrArgsToEnum(policies);
    let segmentBudgets;
    segmentBudgets = await API.budget.createBudget({
        policies: policies,
        prefers: [],
        staffs: staffs,
        fromCity,
        ret,
        segments,
    });
    let budgets = segmentBudgets.budgets;
    budgets = transformBundgets(budgets);
    segmentBudgets.budgets = budgets;
    res['openapiRes'](0, '', segmentBudgets)
}));

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

function transformBundgets(budgets) {
    if (!budgets) {
        return budgets;
    }
    for(let city in budgets) {
        let segmentBudget = budgets[city];
        let trafficBudget = segmentBudget.traffic;
        let hotelBudget = segmentBudget.hotel;
        if (!trafficBudget) {
            trafficBudget = [];
        }
        if (!hotelBudget) {
            hotelBudget = [];
        }
        trafficBudget = trafficBudget.map( (budget) => {
            if (budget.trafficType == 1) {
                budget.cabin = enumToStr(CABIN, budget.cabin) || budget.cabin;
            } else {
                budget.cabin = enumToStr(TRAIN_SEAT, budget.cabin) || budget.cabin;
            }
            budget.trafficType = enumToStr(TRAFFIC_TYPE, budget.trafficType) || budget.trafficType;
            return budget;
        });
        hotelBudget = hotelBudget.map( (budget) => {
            budget.star = enumToStr(HOTEL_START, budget.star) || budget.star;
            return budget;
        });
        segmentBudget.traffic = trafficBudget;
        segmentBudget.hotel = hotelBudget;
        budgets[city] = segmentBudget;
    }
    return budgets;
}

function transformCity(city) {
    return {
        id: city.id,
        name: city.name,
        pinyin: city.pinyin,
        letter: city.letter,
        latitude: city.latitude,
        longitude: city.longitude,
        parentId: city.parentId,
    }
}

route.use((err, req, res, next) => {
    logger.error(err && err.stack ? err.stack : err);
    res['openapiRes'](500, '系统错误', {});
});

export= route;