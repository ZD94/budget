/**
 * Created by wlh on 15/12/12.
 */
import {
    IQueryBudgetParams, ITrafficBudgetItem, EAirCabin,
    EBudgetType, IHotelBudgetItem, EHotelStar, IQueryTrafficBudgetParams, IQueryHotelBudgetParams, IStaff, EGender,
    IHotelBudgetResult, ITrafficBudgetResult, FinalBudgetResultInterface, ISegment, SegmentBudgetItem
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
import {ICity, CityService} from "_types/city";
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
            city = await CityService.getCity(city);
        }

        if (combineRoom) {
            throw L.ERROR_CODE(502, '目前还不支持自动合并住宿');
        }

        if (!policies) {
            policies = {};
        }
        if (!prefers) {
            prefers = {}
        }
        let key = DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_HOTEL;
        let companyPrefers = prefers["domesticHotel"];
        if (city.isAbroad) {
            key = DEFAULT_PREFER_CONFIG_TYPE.ABROAD_HOTEL
            companyPrefers = prefers["abroadHotel"]
        }
        if (!companyPrefers) {
            companyPrefers = [];
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
            let allPrefers = loadPrefers(companyPrefers, {local: {
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
        if (!policies) {
            policies = {};
        }
        if (!prefers) {
            prefers = {};
        }

        if (typeof beginTime == 'string') {
            beginTime = new Date(beginTime);
        }

        if (typeof endTime == 'string') {
            endTime = new Date(endTime);
        }

        if (typeof fromCity == 'string') {
            fromCity = await CityService.getCity(fromCity);
        }
        if (typeof toCity == 'string') {
            toCity = await CityService.getCity(toCity);
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
            // let shipCabin = staffPolicy.shipCabin;
            let qs = {
                local: {
                    expectTrainCabins: trainSeat,
                    expectFlightCabins: cabin,
                    leaveDate: moment(beginTime).format("YYYY-MM-DD"),
                    earliestLeaveDateTime: beginTime,
                    latestArrivalDateTime: endTime,
                }
            }

            let allPrefers;
            if ((<ICity>fromCity).isAbroad || (<ICity>toCity).isAbroad) {
                let key = DEFAULT_PREFER_CONFIG_TYPE.ABROAD_TRAFFIC;
                allPrefers = loadPrefers(prefers["abroadTraffic"] || [], qs, key)
            } else {
                let key = DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_TICKET;
                allPrefers = loadPrefers(prefers["domesticTraffic"] || [], qs, key)
            }
            let strategy = await TrafficBudgetStrategyFactory.getStrategy({
                fromCity,
                toCity,
                beginTime,
                endTime,
                policies,
                prefers: allPrefers,
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
                prefers: allPrefers,
            }
            return trafficBudget as ITrafficBudgetItem;
        }))

        return staffBudgets;
    }

    static async createBudget(params: IQueryBudgetParams) :Promise<FinalBudgetResultInterface>{
        let {policies, staffs, segments, fromCity, prefers, ret, tickets, hotels, isRetMarkedData} = params;
        let budgets = [];
        let segBudgets = {};
        let cities = [];
        if (typeof fromCity == 'string') {
            fromCity = await CityService.getCity(fromCity);
        }
        if (ret) {
            let lastIdx = segments.length -1;
            let segment: ISegment = {
                city: fromCity,
                beginTime: segments[lastIdx].endTime,
                endTime: moment(segments[lastIdx].endTime).format('YYYY-MM-DD 21:00'),
                noHotel: true,
            }
            segments.push(segment);
        }

        for(var i=0, ii=segments.length; i<ii; i++) {
            let seg = segments[i];
            let toCity = seg.city;
            if (typeof toCity == 'string') {
                toCity = await CityService.getCity(toCity);
            }
            let trafficBudget;
            if (!seg.noTraffic) {
                let trafficParams = {
                    policies,
                    staffs: seg.staffs && seg.staffs.length ? seg.staffs : staffs,
                    fromCity: fromCity,
                    toCity: toCity,
                    beginTime: seg.beginTime,
                    endTime: seg.endTime,
                    prefers,
                    tickets,
                    isRetMarkedData: true,
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
                    isRetMarkedData: true,
                }
                hotelBudget = await ApiTravelBudget.getHotelBudget(hotelParams);
            }
            fromCity = toCity;
            budgets.push({hotel: hotelBudget, traffic: trafficBudget});
            //城市
            cities.push(toCity.id);
        }
        //如果有返程，计算返程交通预算

        let result: FinalBudgetResultInterface = {
            cities: cities,
            budgets: budgets
        }

        let m = Models.budget.create({query: params, result: result});
        m = await m.save();
        result.id = m.id;
        return handleBudgetResult(result, isRetMarkedData)
    }

    static async getBudgetCache(params: {id: string, isRetMarkedData?: boolean}) :Promise<FinalBudgetResultInterface>{
        let {id, isRetMarkedData} = params;
        if (!id) {
            throw L.ERR.INVALID_ARGUMENT("id");
        }
        if (!isRetMarkedData) {
            isRetMarkedData = false;
        }
        let m = await Models.budget.get(id);
        if (!m) {
            throw L.ERR.INVALID_ARGUMENT("id");
        }
        m.result.id = m.id;
        return handleBudgetResult(m.result, isRetMarkedData);
    }

    static __initHttpApp = require("./http");
}

function handleBudgetResult(data: FinalBudgetResultInterface, isRetMarkedData: boolean) :FinalBudgetResultInterface {
    let result;
    let d = _.cloneDeep(data);

    if(!isRetMarkedData) {
        result = d.budgets.map( (v: SegmentBudgetItem) => {
            if (!v)
                return v;
            let hotelBudgets = v.hotel || [];
            let trafficBudgets = v.traffic || [];

            v.hotel = hotelBudgets.map((budget: IHotelBudgetItem) => {
                delete budget.prefers;
                delete budget.markedScoreData;
                return budget;
            });
            v.traffic = trafficBudgets.map( (budget: ITrafficBudgetItem) => {
                delete budget.prefers;
                delete budget.markedScoreData;
                return budget;
            })
            return v;
        })
    } else {
        result = d.budgets;
    }
    d.budgets = result;
    return d;
}