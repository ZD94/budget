/**
 * Created by wlh on 15/12/12.
 */
import {
    IQueryBudgetParams, ITrafficBudgetItem, EAirCabin,
    EBudgetType, IHotelBudgetItem, EHotelStar, IQueryTrafficBudgetParams, IQueryHotelBudgetParams, IStaff, EGender,
    IHotelBudgetResult, ITrafficBudgetResult, FinalBudgetResultInterface, ISegment
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
import {ICity} from "_types/city";
import {countDays} from "./helper";
var API = require("@jingli/dnode-api");

export default class ApiTravelBudget {

    static async getHotelBudget(params: IQueryHotelBudgetParams) :Promise<IHotelBudgetResult> {
        if (!params) {
            throw L.ERROR_CODE(500, 'params not exist');
        }

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

        if (typeof city == 'string') {
            city = (await API.place.getCityInfo({cityCode: city})) as ICity;
        }

        if (combineRoom) {
            throw L.ERROR_CODE(502, '目前还不支持自动合并住宿');
        }

        // if (staffs && staffs.length > 1) {
        //     throw L.ERROR_CODE(502, '目前仅支持单人住宿预算');
        // }

        if (!policies) {
            policies = {};
        }

        let key = DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_HOTEL;
        if (city.isAbroad) {
            key = DEFAULT_PREFER_CONFIG_TYPE.INTERNAL_HOTEL
        }
        if (!hotels || !hotels.length) {
            hotels = await API.hotel.search_hotels({
                checkInDate,
                checkOutDate,
                city,
                latitude: city.latitude,
                longitude: city.longitude,
            })
        }

        let budgets = await Promise.all( staffs.map( async (staff) => {
            let policyKey = staff.policy || 'default';
            let staffPolicy = policies[policyKey] || {};
            let star = staffPolicy.hotelStar;
            let allPrefers = loadPrefers(prefers, {local: {
                checkInDate,
                checkOutDate,
                star,
            }}, key);
            //需要的差旅标准
            let strategy = await HotelBudgetStrategyFactory.getStrategy({
                star: star,
                checkInDate,
                checkOutDate,
                prefers: allPrefers,
            }, {isRecord: false});
            let budget = await strategy.getResult(hotels, isRetMarkedData);

            let hotelBudget: IHotelBudgetItem = {
                checkInDate: params.checkInDate,
                checkOutDate: params.checkOutDate,
                city: (<ICity>city).id,
                star: EHotelStar.FIVE,
                price: budget.price,
                type: EBudgetType.HOTEL,
                name: budget.name,
                agent: budget.agent,
                link: budget.link,
                markedScoreData: budget.markedScoreData,
                prefers: allPrefers,
            }
            return hotelBudget;
        }));
        return budgets;
    }

    static async getTrafficBudget(params: IQueryTrafficBudgetParams) :Promise<ITrafficBudgetResult> {
        //开始时间,结束时间，差旅标准,企业差旅偏好,票据数据,出差人,是否返回打分数据
        let {fromCity, toCity, beginTime, endTime, policies, prefers, tickets, staffs, isRetMarkedData} = params;
        let requiredParams = {
            fromCity: "出发城市",
            toCity: '目的地',
            beginTime: '事情开始时间',
            endTime: '事情终结时间',
            policies: '差旅政策',
            staffs: '出差人',
        }
        for(let key in requiredParams) {
            if (!params[key]) {
                throw L.ERR.NOT_ACCEPTABLE(requiredParams[key]);
            }
        }
        let sysPrefers;
        if (!policies) {
            policies = {};
        }
        if (!prefers) {
            prefers = [];
        }

        if (typeof beginTime == 'string') {
            beginTime = new Date(beginTime);
        }

        if (typeof endTime == 'string') {
            endTime = new Date(endTime);
        }

        if (typeof fromCity == 'string') {
            fromCity = await API.place.getCityInfo({cityCode: fromCity});
        }
        if (typeof toCity == 'string') {
            toCity = await API.place.getCityInfo({cityCode: toCity});
        }

        if (!tickets) {
            let trainTickets = await API.train.search_ticket({
                leaveDate: beginTime,
                originPlace: fromCity,
                destination: toCity,
                // cabin: trainSeat,
            });
            let flightTickets = await API.flight.search_ticket({
                leaveDate: beginTime,
                originPlace: fromCity,
                destination: toCity,
                // cabin: cabin
            });
            if (!trainTickets) {
                trainTickets = []
            }
            if (!flightTickets) {
                flightTickets = [];
            }
            tickets = _.concat(trainTickets, flightTickets);
        }

        let staffBudgets = await Promise.all( staffs.map( async (staff) => {
            let policyKey = staff.policy || 'default';
            let staffPolicy = policies[policyKey] || {};
            let trainSeat = staffPolicy.trainSeat;
            let cabin = staffPolicy.cabin;
            let shipCabin = staffPolicy.shipCabin;
            let qs = {
                local: {
                    expectTrainCabins: trainSeat,
                    expectFlightCabins: cabin,
                    leaveDate: moment(beginTime).format("YYYY-MM-DD"),
                    earliestLeaveDateTime: beginTime,
                    latestArrivalDateTime: endTime,
                }
            }

            if ((<ICity>fromCity).isAbroad || (<ICity>toCity).isAbroad) {
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

            let budget = await strategy.getResult(tickets, isRetMarkedData);

            let trafficBudget: ITrafficBudgetItem = {
                departTime: budget.departTime,
                arrivalTime: budget.arrivalTime,
                trafficType: budget.trafficType,
                cabin: budget.cabin,
                fromCity: budget.fromCity,
                toCity: budget.toCity,
                type: EBudgetType.TRAFFIC,
                price: budget.price,
                discount: null,
                markedScoreData: budget.markedScoreData,
                prefers: prefers,
            }
            return trafficBudget as ITrafficBudgetItem;
        }))

        return staffBudgets;
    }

    static async createBudget(params: IQueryBudgetParams) :Promise<FinalBudgetResultInterface>{
        let {policies, staffs, segments, fromCity, prefers, ret, tickets, hotels, isRetMarkedData} = params;
        let segBudgets = {};
        let cities = [];
        if (typeof fromCity == 'string') {
            fromCity = (await API.place.getCityInfo({cityCode: fromCity})) as ICity;
        }
        if (ret) {
            let l = segments.length;
            let segment: ISegment = {
                city: segments[l].city,
                beginTime: segments[l].endTime,
                endTime: moment(segments[l].endTime).format('YYYY-MM-DD 21:00'),
                noHotel: true,
            }
            segments.push(segment);
        }

        for(var i=0, ii=segments.length; i<ii; i++) {
            let seg = segments[i];
            let toCity = seg.city;
            if (typeof toCity == 'string') {
                toCity = (await API.place.getCityInfo({cityCode: toCity})) as ICity;
            }
            let trafficBudget;
            if (!seg.noTraffic) {
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
                trafficBudget = await ApiTravelBudget.getTrafficBudget(trafficParams);
            }
            let hotelBudget;
            if (!seg.noHotel && countDays(seg.endTime, seg.beginTime) > 0) {
                //判断停留时间是否跨天
                let days = moment(moment(seg.endTime).format("YYYY-MM-DD")).diff(moment(seg.beginTime).format("YYYY-MM-DD"), 'days');
                let hotelParams = {
                    policies,
                    staffs,
                    city: toCity,
                    checkInDate: seg.beginTime,
                    checkOutDate: seg.endTime,
                    prefers,
                    hotels,
                    isRetMarkedData,
                }
                hotelBudget = await ApiTravelBudget.getHotelBudget(hotelParams);
            }
            fromCity = toCity;
            //预算
            segBudgets[toCity.id] = {
                hotel: hotelBudget,
                traffic: trafficBudget,
            }
            //城市
            cities.push(toCity.id);
        }
        //如果有返程，计算返程交通预算

        let result: FinalBudgetResultInterface = {
            cities: cities,
            budgets: segBudgets
        }

        let m = Models.budget.create({query: params, result: result});
        m = await m.save();
        result.id = m.id;
        return result;
    }

    static async getBudgetCache(params: {id: string}) :Promise<FinalBudgetResultInterface>{
        let {id} = params;
        if (!id) {
            throw L.ERR.INVALID_ARGUMENT("id");
        }
        let m = await Models.budget.get(id);
        if (!m) {
            throw L.ERR.INVALID_ARGUMENT("id");
        }
        m.result.id = m.id;
        return m.result;
    }

    static __initHttpApp = require("./http");
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