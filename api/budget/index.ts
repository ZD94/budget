/**
 * Created by wlh on 15/12/12.
 */
import {
    IQueryBudgetParams, ITrafficBudgetItem, EAirCabin,
    EBudgetType, IHotelBudgetItem, EHotelStar, IQueryTrafficBudgetParams, IQueryHotelBudgetParams, IStaff, EGender,
    IHotelBudgetResult, ITrafficBudgetResult, FinalBudgetResultInterface, ISegment, SegmentBudgetItem, ETrafficType,
    BudgetItem, IHotel, ITicket
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
            preferSet,
            policies,
            staffs,
            combineRoom,
            city,
            isRetMarkedData,
            location,
        } = params;

        if (typeof city == 'string') {
            city = await CityService.getCity(city);
        }
        if (!location) {
            location = {
                latitude: city.latitude,
                longitude: city.longitude
            };
        }

        if (combineRoom) {
            throw L.ERROR_CODE(502, '目前还不支持自动合并住宿');
        }

        if (!policies) {
            policies = {};
        }
        if (!preferSet) {
            preferSet = {}
        }
        let key = DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_HOTEL;
        let companyPrefers = preferSet["domesticHotel"];
        if (city.isAbroad) {
            key = DEFAULT_PREFER_CONFIG_TYPE.ABROAD_HOTEL
            companyPrefers = preferSet["abroadHotel"]
        }
        if (!companyPrefers) {
            companyPrefers = [];
        }
        if (!hotels || !hotels.length) {
            hotels = await API.hotel.search_hotels({
                checkInDate,
                checkOutDate,
                city,
                latitude: location && location.latitude ? location.latitude: city.latitude,
                longitude: location && location.longitude ? location.longitude: city.longitude,
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
                latitude: location.latitude,
                longitude: location.longitude,
            }}, key);

            //追加员工设置的标准
            if (typeof staffPolicy.hotelPrefer == 'number' && staffPolicy.hotelPrefer >= 0 ) {
                [EHotelStar.FIVE, EHotelStar.FOUR, EHotelStar.THREE, EHotelStar.TOW].forEach( (star) => {
                    allPrefers.push({
                        "name":"price",
                        "options":{"type":"square","score":50000,"level":[star],"percent": staffPolicy.hotelPrefer / 100 }
                    })
                })
            }

            //需要的差旅标准
            let strategy = await HotelBudgetStrategyFactory.getStrategy({
                star: star,
                checkInDate,
                checkOutDate,
                prefers: allPrefers,
                city: city,
                location,
            }, {isRecord: true});
            let budget = await strategy.getResult(hotels, isRetMarkedData);

            let hotelBudget: IHotelBudgetItem = {
                id: budget.id,
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
        let {fromCity, toCity, beginTime, endTime, policies, preferSet, tickets, staffs, isRetMarkedData} = params;
        let requiredParams = {
            fromCity: "出发城市",
            toCity: '目的地',
            // beginTime: '事情开始时间',
            // endTime: '事情终结时间',
            policies: '差旅政策',
            staffs: '出差人',
        }
        for(let key in requiredParams) {
            if (!params[key]) {
                throw L.ERR.ERROR_CODE_C(500, `缺少${requiredParams[key]}参数`);
            }
        }
        if (!policies) {
            policies = {};
        }
        if (!preferSet) {
            preferSet = {};
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
            tickets = await API.traffic.search_tickets({
                leaveDate: moment(beginTime).format('YYYY-MM-DD'),
                originPlace: fromCity.id,
                destination: toCity.id
            })
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
                    earliestLeaveDateTime: endTime,
                    latestArrivalDateTime: beginTime,
                }
            }

            let allPrefers;
            if ((<ICity>fromCity).isAbroad || (<ICity>toCity).isAbroad) {
                let key = DEFAULT_PREFER_CONFIG_TYPE.ABROAD_TRAFFIC;
                allPrefers = loadPrefers(preferSet["abroadTraffic"] || [], qs, key)
            } else {
                let key = DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_TICKET;
                allPrefers = loadPrefers(preferSet["domesticTraffic"] || [], qs, key)
            }
            //追加员工特殊偏好
            if (typeof staffPolicy.trafficPrefer == 'number' && staffPolicy.trafficPrefer >= 0) {
                [EAirCabin.BUSINESS, EAirCabin.ECONOMY, EAirCabin.FIRST, EAirCabin.PREMIUM_ECONOMY].forEach( (cabin) => {
                    allPrefers.push({
                        "name":"price",
                        "options":{"type":"square","score":50000,"level":[cabin],"percent": staffPolicy.trafficPrefer / 100 }
                    })
                });
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
            }, {isRecord: true});

            let budget = await strategy.getResult(tickets, isRetMarkedData);
            let discount = 0;
            if (budget.trafficType == ETrafficType.PLANE) {
                let fullPrice = await API.place.getFlightFullPrice({originPlace: budget.fromCity, destination: budget.toCity});
                let price = fullPrice ? (EAirCabin.ECONOMY ? fullPrice.EPrice: fullPrice.FPrice): 0;
                if (price) {
                    discount = Math.round(budget.price/ price * 100)/100
                    discount = discount < 1? discount:1;
                }
            }
            let trafficBudget: ITrafficBudgetItem = {
                id: budget.id,
                departTime: budget.departTime,
                arrivalTime: budget.arrivalTime,
                trafficType: budget.trafficType,
                cabin: budget.cabin,
                fromCity: budget.fromCity,
                toCity: budget.toCity,
                type: EBudgetType.TRAFFIC,
                price: budget.price,
                discount: discount,
                markedScoreData: budget.markedScoreData,
                prefers: allPrefers,
            }
            return trafficBudget as ITrafficBudgetItem;
        }))

        return staffBudgets;
    }

    static async createBudget(params: IQueryBudgetParams) :Promise<FinalBudgetResultInterface>{
        try {
            let {policies, staffs, segments, fromCity, preferSet, ret, tickets, hotels, isRetMarkedData, backCity} = params;
            let budgets = [];
            let cities = [];
            if (fromCity && typeof fromCity == 'string') {
                fromCity = await CityService.getCity(fromCity);
            }
            if (backCity && typeof backCity == 'string') {
                backCity = await CityService.getCity(backCity);
            }
            if (ret && fromCity) {
                if (!backCity) {
                    backCity = fromCity;
                }
                let lastIdx = segments.length -1;
                let segment: ISegment = {
                    city: backCity,
                    beginTime: segments[lastIdx].endTime,
                    endTime: moment(segments[lastIdx].endTime).format('YYYY-MM-DD 21:00'),
                    noHotel: true,
                }
                segments.push(segment);
            }

            let tasks: Promise<any>[] = [];
            for(var i=0, ii=segments.length; i<ii; i++) {
                let seg = segments[i];
                let toCity = seg.city;
                if (typeof toCity == 'string') {
                    toCity = await CityService.getCity(toCity);
                }
                let trafficBudget;
                if (fromCity && !seg.noTraffic) {
                    let trafficParams = {
                        policies,
                        staffs: seg.staffs && seg.staffs.length ? seg.staffs : staffs,
                        fromCity: fromCity,
                        toCity: toCity,
                        beginTime: seg.beginTime,
                        // endTime: seg.endTime,
                        preferSet,
                        tickets,
                        isRetMarkedData: isRetMarkedData,
                    }
                    tasks.push(ApiTravelBudget.getTrafficBudget(trafficParams));
                } else {
                    tasks.push(null);
                }

                let hotelBudget;
                //判断停留时间是否跨天
                let timezone = toCity.timezone || 'Asia/Shanghai';
                if (!seg.noHotel && countDays(seg.endTime, seg.beginTime, timezone) > 0) {
                    let checkOutDate = moment(seg.endTime).tz(timezone).format("YYYY-MM-DD")
                    let checkInDate = moment(seg.beginTime).tz(timezone).format("YYYY-MM-DD")
                    let days = moment(checkOutDate).diff(checkInDate, 'days');
                    let hotelParams = {
                        policies,
                        staffs,
                        city: toCity,
                        checkInDate: checkInDate,
                        checkOutDate: checkOutDate,
                        preferSet,
                        hotels,
                        isRetMarkedData: isRetMarkedData,
                        location: seg.location,
                    }
                    tasks.push(ApiTravelBudget.getHotelBudget(hotelParams))
                } else {
                    tasks.push(null);
                }
                fromCity = toCity;
                //城市
                cities.push(toCity.id);
            }

            let budgetResults = await Promise.all(tasks);
            for(var i=0, ii=budgetResults.length; i<ii; i=i+2) {
                budgets.push({
                    traffic: budgetResults[i],
                    hotel: budgetResults[i+1]
                })
            }

            let result: FinalBudgetResultInterface = {
                cities: cities,
                budgets: budgets
            }

            let m = Models.budget.create({query: params, result: result});
            m = await m.save();
            result.id = m.id;
            return handleBudgetResult(result, isRetMarkedData)
        } catch(err) {
            console.error(err);
            throw err;
        }
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

    static async getBudgetItems(params: {page: number, pageSize: number, type: number}) :Promise<BudgetItem[]>{
        let {page, pageSize, type} = params;
        let where: any = {};
        if (type) {
            where.type = type;
        }
        if (page < 0) {
            page = 0;
        }
        if (pageSize <1) {
            pageSize = 10;
        }
        let offset = ( page - 1 ) * pageSize;
        let pager = await Models.budgetItem.find({where: where, limit: pageSize, offset: offset, order: [["created_at", "desc"]]});
        let result = Array.from(pager);
        return result;
    }

    /**
     * 用户调试预算
     *
     * @param params
     * @param {number} params.type 类型 1.交通 2.酒店
     * @param {array<IHotel>| array<ITicket>} params.originData 原始数据
     * @param {json} qs 查询条件
     * @returns {Promise<Budget>}
     */
    static async debugBudgetItem(params: {type: number, originData: IHotel[]|ITicket[], query: any, prefers: any[]}) {
        try {
            let result;
            let {query, prefers, type, originData} = params;
            query.prefers = prefers;
            if (type == 1) {
                let strategy = await TrafficBudgetStrategyFactory.getStrategy(query, {isRecord: false});
                result = await strategy.getResult(<ITicket[]>originData, true)
            } else {
                let strategy = await HotelBudgetStrategyFactory.getStrategy(query, {isRecord: false});
                result = await strategy.getResult(<IHotel[]>originData, true);
            }
            // result.prefers = prefers;
            result.markedData = result.markedScoreData;
            delete result.markedScoreData;
            return result;
        } catch(err) {
            console.error(err.stack);
            throw err;
        }

    }
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