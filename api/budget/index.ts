/**
 * Created by wlh on 2017/3/10.
 */

'use strict';
import {
    IQueryBudgetParams, IBudgetResult, IBudgetItem, ITrafficBudgetItem, ETrafficType, EAirCabin,
    EBudgetType, IHotelBudgetItem, EHotelStar, IQueryTrafficBudgetParams, IQueryHotelBudgetParams
} from "_type/budget";
import {HotelBudgetStrategyFactory, TrafficBudgetStrategyFactory} from "./strategy/index";
import {Models} from "_type/index";
import {loadDefaultPrefer, DEFAULT_PREFER_CONFIG_TYPE} from "./prefer/index";
const L = require("common/language");
import _ = require("lodash");

class BudgetModule {

    static async getHotelBudget(params: IQueryHotelBudgetParams) :Promise<IHotelBudgetItem> {
        //酒店原始数据, 入住日期，离店日期，公司偏好，个人差旅标准，员工，是否同性合并
        let {hotels, checkInDate, checkOutDate, prefers, policies, staffs, combineRoom, isRetMarkedData} = params;
        if (staffs && staffs.length > 1) {
            throw L.ERR.NOT_ACCEPTABLE("目前仅支持单人出差");
        }
        if (!policies) {
            policies = {};
        }
        let policyKey = staffs[0].policy || 'default';
        let staffPolicy = policies[policyKey] || {};
        let star = staffPolicy.hotelStar;

        //合并系统默认标准与企业标准
        let sysPrefers = loadDefaultPrefer({
            local: {
                checkInDate,
                checkOutDate,
                star
            }
        }, DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_HOTEL);
        prefers = mergeJSON(sysPrefers, prefers);

        //需要的差旅标准
        let strategy = await HotelBudgetStrategyFactory.getStrategy({
            star: star,
            checkInDate,
            checkOutDate,
            prefers,
            staffs,
            combineRoom,
        }, {isRecord: false});

        let budget = await strategy.getResult(hotels, isRetMarkedData);

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
        }
        return hotelBudget;
    }

    static async getTrafficBudget(params: IQueryTrafficBudgetParams) :Promise<ITrafficBudgetItem> {
        //开始时间,结束时间，差旅标准,企业差旅偏好,票据数据,出差人,是否返回打分数据
        let {fromCity, toCity, beginTime, endTime, policies, prefers, tickets, staffs, isRetMarkedData} = params;
        if (staffs && staffs.length > 1) {
            throw L.ERR.NOT_ACCEPTABLE("目前仅支持单人出差");
        }

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
            discount: 0.5,
            markedScoreData: budget.markedScoreData,
        }
        return trafficBudget;
    }

    static async getBudget(params: IQueryBudgetParams) :Promise<IBudgetResult>{
        let {policies, staffs, segs, fromCity, prefers, ret, tickets, hotels, isRetMarkedData, appid} = params;

        let app = await Models.app.get(appid);
        if (!app) {
            throw new Error("appid invalid");
        }
        if (!app.isSupportDebug) {
            isRetMarkedData = false;
        }
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

            let trafficBudget = await BudgetModule.getTrafficBudget(trafficParams);
            budgets.push(trafficBudget);
            let hotelParams = {
                policies,
                staffs,
                city: toCity,
                checkInDate: seg.beginTime,
                checkOutDate: seg.endTime,
                prefers,
                hotels,
                isRetMarkedData
            }
            let hotelBudget = await BudgetModule.getHotelBudget(hotelParams);
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
        let app = await Models.app.get(appid);
        if (!app) {
            throw new Error("invalid appid");
        }
        let m = await Models.budget.get(id);
        return {
            id: m.id,
            budgets: m.result,
        }
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

export= BudgetModule;