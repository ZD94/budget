/**
 * Created by wlh on 15/12/12.
 */
import {
    IQueryBudgetParams, IBudgetResult, IBudgetItem, ITrafficBudgetItem, EAirCabin,
    EBudgetType, IHotelBudgetItem, EHotelStar, IQueryTrafficBudgetParams, IQueryHotelBudgetParams
} from "_types/budget";

const validate = require("common/validate");
import L from '@jingli/language';
const moment = require('moment');
const cache = require("common/cache");
const utils = require("common/utils");
import _ = require("lodash");

import {
    TrafficBudgetStrategyFactory, HotelBudgetStrategyFactory
} from "./strategy/index";

import {DEFAULT_PREFER_CONFIG_TYPE, loadPrefers} from "./prefer";
import {Models} from "_types/index";

export default class ApiTravelBudget {

    static async getHotelBudget(params: IQueryHotelBudgetParams) :Promise<IHotelBudgetItem> {
        //酒店原始数据, 入住日期，离店日期，公司偏好，个人差旅标准，员工，是否同性合并
        let {
            hotels,
            checkInDate,
            checkOutDate,
            prefers,
            policies,
            staffs,
            combineRoom,
            city,
            isRetMarkedData
        } = params;

        if (staffs && staffs.length > 1) {
            throw L.ERR.NOT_ACCEPTABLE("目前仅支持单人出差");
        }
        if (!policies) {
            policies = {};
        }
        let policyKey = staffs[0].policy || 'default';
        let staffPolicy = policies[policyKey] || {};
        let star = staffPolicy.hotelStar;
        let key = DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_HOTEL;
        if (city.isAbroad) {
            key = DEFAULT_PREFER_CONFIG_TYPE.INTERNAL_HOTEL
        }
        prefers = loadPrefers(prefers, {local: {
            checkInDate,
            checkOutDate,
            star,
        }}, key);

        //需要的差旅标准
        let strategy = await HotelBudgetStrategyFactory.getStrategy({
            star: star,
            checkInDate,
            checkOutDate,
            prefers,
            staffs,
            combineRoom,
        }, {isRecord: false});

        let budget = await strategy.getResult(hotels);

        let hotelBudget: IHotelBudgetItem = {
            checkInDate: params.checkInDate,
            checkOutDate: params.checkOutDate,
            star: EHotelStar.FIVE,
            price: budget.price,
            type: EBudgetType.HOTEL,
            name: budget.name,
            agent: budget.agent,
            link: budget.link,
            markedScoreData: budget.markedScoreData,
            prefers: prefers,
        }
        return hotelBudget;
    }

    static async getTrafficBudget(params: IQueryTrafficBudgetParams) :Promise<ITrafficBudgetItem> {
        //开始时间,结束时间，差旅标准,企业差旅偏好,票据数据,出差人,是否返回打分数据
        let {fromCity, toCity, beginTime, endTime, policies, prefers, tickets, staffs, isRetMarkedData} = params;
        if (staffs && staffs.length > 1) {
            throw L.ERR.NOT_ACCEPTABLE("目前仅支持单人出差");
        }
        let sysPrefers;
        if (!policies) {
            policies = {};
        }
        let policyKey = staffs[0].policy || 'default';
        let staffPolicy = policies[policyKey] || {};
        let trainSeat = staffPolicy.trainSeat;
        let cabin = staffPolicy.cabin;
        let shipCabin = staffPolicy.shipCabin;

        if (typeof beginTime == 'string') {
            beginTime = new Date(beginTime);
        }
        if (typeof endTime == 'string') {
            endTime = new Date(endTime);
        }
        let qs = {
            local: {
                expectTrainCabins: trainSeat,
                expectFlightCabins: cabin,
                leaveDate: moment(beginTime).format("YYYY-MM-DD"),
                earliestLeaveDateTime: beginTime,
                latestArrivalDateTime: endTime,
            }
        }
        if (fromCity.isAbroad || toCity.isAbroad) {
            sysPrefers = loadPrefers(prefers, qs, DEFAULT_PREFER_CONFIG_TYPE.INTERNAL_TICKET)
        } else {
            sysPrefers = loadPrefers(prefers, qs, DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_TICKET)
        }
        prefers = mergeJSON(sysPrefers, prefers)
        let strategy = await TrafficBudgetStrategyFactory.getStrategy({
            fromCity,
            toCity,
            beginTime,
            endTime,
            policies,
            prefers,
            tickets,
            staffs,
        }, {isRecord: false});

        let budget: ITrafficBudgetItem = await strategy.getResult(tickets, isRetMarkedData);
        let trafficBudget: ITrafficBudgetItem = {
            departTime: budget.departTime,
            arrivalTime: budget.arrivalTime,
            trafficType: budget.trafficType,
            cabin: EAirCabin.ECONOMY,
            fromCity: budget.fromCity,
            toCity: budget.toCity,
            type: EBudgetType.TRAFFIC,
            price: budget.price,
            discount: null,
            markedScoreData: budget.markedScoreData,
            prefers: prefers,
        }
        return trafficBudget;
    }

    static async getBudget(params: IQueryBudgetParams) :Promise<IBudgetResult>{
        let {policies, staffs, segs, fromCity, prefers, ret, tickets, hotels, isRetMarkedData, appid} = params;
        let budgets: IBudgetItem[] = [];
        for(var i=0, ii=segs.length; i<ii; i++) {
            let seg = segs[i];
            let toCity = seg.city;
            let trafficParams = {
                policies,
                staffs,
                fromCity: fromCity,
                toCity: toCity,
                beginTime: seg.beginTime,
                endTime: seg.endTime,
                prefers,
                tickets,
                isRetMarkedData
            }

            let trafficBudget = await ApiTravelBudget.getTrafficBudget(trafficParams);
            budgets.push(trafficBudget);
            let hotelParams = {
                policies,
                staffs,
                city: toCity,
                checkInDate: seg.beginTime,
                checkOutDate: seg.endTime,
                prefers,
                hotels,
                isRetMarkedData,
                appid,
            }
            let hotelBudget = await ApiTravelBudget.getHotelBudget(hotelParams);
            budgets.push(hotelBudget);
            fromCity = toCity;
        }

        //删除原始数据
        delete params.hotels;
        delete params.tickets;

        let m = Models.budget.create({appid: appid, query: params, result: budgets});
        m = await m.save();
        let result: IBudgetResult = {
            id: m.id,
            budgets: budgets,
        }
        return result;
    }

    static async getBudgetCache(params: {appid: string, id: string}) :Promise<IBudgetResult>{
        let {appid, id} = params;
        if (!appid) {
            throw L.ERR.INVALID_ARGUMENT("appid")
        }
        if (!id) {
            throw L.ERR.INVALID_ARGUMENT("id");
        }
        let m = await Models.budget.get(id);
        if (!m) {
            throw L.ERR.INVALID_ARGUMENT("id");
        }
        if (m.appid != appid) {
            throw L.ERR.NOT_FOUND();
        }
        return {
            id: m.id,
            budgets: m.result,
        }
    }

    static __initHttpApp(app) {
        app.post('/api/v1/budget/make', (req, res, next) => {
            let qs: IQueryBudgetParams
            let json = req.body.json;
            if (typeof json == 'string') {
                qs = JSON.parse(json);
            } else {
                qs = json;
            }
            return ApiTravelBudget.getBudget(qs)
            .then( (result) => {
                res.json(result);
            })
            .catch(next);
        })

        app.get('/api/v1/budget/info', (req, res, next) => {
            let {appid, id} = req.query;
            return ApiTravelBudget.getBudgetCache({appid, id})
            .then( (result) => {
                res.json(result);
            })
            .catch(next);
        })

        app.use('/api/v1/budget', function(err, req, res, next) {
            res.json(err);
        })
    }
}

function mergeJSON(defaults, news) {
    for(let i=0, ii =news.length; i<ii; i++) {
        let v = news[i];
        let isHas = false;  //是否包含
        //查找defaults中是否包含
        for(let j=0, jj=defaults.length; j<jj; j++) {
            if (v.name == defaults[j].name) {
                isHas = true;
                defaults[j] = _.defaultsDeep(v, defaults[j]);
                break;
            }
        }
        if (!isHas) {
            defaults.push(v);
        }
    }
    return defaults;
}

function getTimezoneStr(seconds) {
    const HOUR = 60 * 60
    const MINUTE = 60;
    let hours = seconds / HOUR
    if (hours < 0) {
        hours = Math.ceil(hours);
    } else {
        hours = Math.floor(hours);
    }
    let minute = (seconds - hours * HOUR) / MINUTE;
    if (minute < 0) {
        minute = Math.ceil(minute)
    } else {
        minute = Math.floor(minute)
    }
    let ret = 'GMT';
    if (hours < 0) {
        ret += '-'
        if (hours > -10) {
            ret += '0'
        }
        hours = -hours;
        ret += hours;
    } else {
        ret += '+';
        if (hours < 10) {
            ret += '0'
        }
        ret += hours;
    }
    if (minute < 0) {
        minute = -minute;
    }
    if (minute < 10) {
        ret += '0'
    }
    ret += minute;
    return " "+ret;
}