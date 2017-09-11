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
var request = require("request");
let scheduler = require('common/scheduler');
import {ExchangeRate} from "_types/currency"

import {
    TrafficBudgetStrategyFactory, HotelBudgetStrategyFactory
} from "./strategy/index";

import {DEFAULT_PREFER_CONFIG_TYPE, loadPrefers} from "./prefer";
import {Models} from "_types/index";
import {ICity, CityService} from "_types/city";
import {countDays} from "./helper";
var API = require("@jingli/dnode-api");
import Logger from "@jingli/logger";
var logger = new Logger("budget");
import { TravelPolicy} from "_types/policy";
export var NoCityPriceLimit = 0;
class ApiTravelBudget {

    static async getHotelBudget(params: IQueryHotelBudgetParams): Promise<IHotelBudgetResult> {
        if (!params) {
            throw new L.ERROR_CODE_C(500, 'params not exist');
        }
        logger.info("Call getHotelBudget params:", params)
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
            preferedCurrency
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
            throw new L.ERROR_CODE_C(502, '目前还不支持自动合并住宿');
        }

        if (!policies) {
            policies = {};
        }
        if (!preferSet) {
            preferSet = {}
        }
        let key = DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_HOTEL;
        let companyPrefers = preferSet["hotel"];
        if (city.isAbroad) {
            key = DEFAULT_PREFER_CONFIG_TYPE.ABROAD_HOTEL
            companyPrefers = preferSet["abroadHotel"]
        }
        if (!companyPrefers) {
            companyPrefers = [];
        }
        if (!hotels || !hotels.length) {
            hotels = await API.hotels.search_hotels({
                checkInDate,
                checkOutDate,
                city: city.id,
                latitude: location && location.latitude ? location.latitude : city.latitude,
                longitude: location && location.longitude ? location.longitude : city.longitude,
            })
        }

        if (new Date(checkInDate) < new Date(moment().format('YYYY-MM-DD'))) {
            throw new L.ERROR_CODE_C(500, '入住日期已过');
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

            let maxPriceLimit = 0;
            let minPriceLimit = 0;
            let days: number = 0;

            let beginTime = moment(params.checkInDate).hour(12);
            let endTime = moment(params.checkOutDate).hour(12);
            days = moment(endTime).diff(beginTime,'days');

            let selector:string;
            if(!city['isAbroad']) {
                 selector = 'domestic'
            } else {
                selector = 'abroad';
            }

            maxPriceLimit = policies[selector].maxPriceLimit;
            minPriceLimit = policies[selector].minPriceLimit;
            budget.price = await ApiTravelBudget.limitHotelBudgetByPrefer(minPriceLimit * days,maxPriceLimit * days,budget.price);

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

    static async getTrafficBudget(params: IQueryTrafficBudgetParams): Promise<ITrafficBudgetResult> {
        //开始时间,结束时间，差旅标准,企业差旅偏好,票据数据,出差人,是否返回打分数据
        let { fromCity, toCity, latestArrivalTime, earliestDepartTime, policies, preferSet, tickets, staffs, isRetMarkedData, preferedCurrency} = params;
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
                throw new L.ERROR_CODE_C(500, `缺少${requiredParams[key]}参数`);
            }
        }
        if (!policies) {
            policies = {};
        }
        if (!preferSet) {
            preferSet = {};
        }

        if (typeof latestArrivalTime == 'string') {
            latestArrivalTime = new Date(latestArrivalTime);
        }

        if (typeof earliestDepartTime == 'string') {
            earliestDepartTime = new Date(earliestDepartTime);
        }

        if (!latestArrivalTime && !earliestDepartTime) { 
            throw new L.ERROR_CODE_C(500, '最早出发，最晚到达时间不能同时为空');
        }

        if (latestArrivalTime && latestArrivalTime < new Date()) {
            throw new L.ERROR_CODE_C(500, '出发日期已过');
        }

        if (earliestDepartTime && earliestDepartTime < new Date()) {
            throw new L.ERROR_CODE_C(500, '出发日期已过');
        }

        if (typeof fromCity == 'string') {
            fromCity = await CityService.getCity(fromCity);
        }
        if (typeof toCity == 'string') {
            toCity = await CityService.getCity(toCity);
        }

        let leaveDate = moment(latestArrivalTime || earliestDepartTime).format('YYYY-MM-DD');
        if (!tickets) {
            tickets = await API.traffic.search_tickets({
                leaveDate: leaveDate,
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
                    leaveDate: leaveDate,
                    earliestLeaveDateTime: earliestDepartTime,
                    latestArrivalDateTime: latestArrivalTime,
                }
            }

            let allPrefers;
            if ((<ICity>fromCity).isAbroad || (<ICity>toCity).isAbroad) {
                let key = DEFAULT_PREFER_CONFIG_TYPE.ABROAD_TRAFFIC;
                allPrefers = loadPrefers(preferSet["abroadTraffic"] || [], qs, key)
            } else {
                let key = DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_TICKET;
                allPrefers = loadPrefers(preferSet["traffic"] || [], qs, key)
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
                latestArrivalTime,
                earliestDepartTime,
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
                unit: budget.unit,
                discount: discount,
                markedScoreData: budget.markedScoreData,
                prefers: allPrefers,
            }
            return trafficBudget as ITrafficBudgetItem;
        }))

        return staffBudgets;
    }

    static limitHotelBudgetByPrefer(min: number, max:number, hotelBudget: number){
        if(hotelBudget == -1) {
            if(max != NoCityPriceLimit) return max;
            return hotelBudget;
        }
        if(min == NoCityPriceLimit && max == NoCityPriceLimit) return hotelBudget;

        if(max != NoCityPriceLimit && min > max) {
            let tmp = min;
            min = max;
            max = tmp;
        }

        if(hotelBudget > max ) {
            if(max != NoCityPriceLimit) return max;
        }
        if(hotelBudget < min ) {
            if(min != NoCityPriceLimit) return min;
        }
        return hotelBudget;
    }


    static async createBudget(params: IQueryBudgetParams) :Promise<FinalBudgetResultInterface>{
        try {  //policies,
            let {  staffs, segments, fromCity, preferSet, ret, tickets, hotels, isRetMarkedData, backCity, travelPolicyId, preferedCurrency } = params;
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
                    beginTime: null,
                    // beginTime: moment(segments[lastIdx].endTime).format('YYYY-MM-DD 18:00:00'),
                    endTime: segments[lastIdx].endTime,
                    noHotel: true,
                }
                segments.push(segment);
            }
            let policies:any = {};
            let tasks: Promise<any>[] = [];
            for(var i=0, ii=segments.length; i<ii; i++) {
                let seg = segments[i];
                let toCity = seg.city;
                if (typeof toCity == 'string') {
                    toCity = await CityService.getCity(toCity);
                }
                let tp: TravelPolicy;
                if(travelPolicyId) {
                    tp = await Models.travelPolicy.get(travelPolicyId);
                }
                if (fromCity && !seg.noTraffic) {
                    if(tp){
                        if(!toCity.isAbroad){
                            policies = {
                                domestic:{
                                    cabin: await tp.getBestTravelPolicy({placeId:toCity["id"], type: "planeLevels"}),
                                    trainSeat: await tp.getBestTravelPolicy({placeId:toCity["id"], type: "trainLevels"}),
                                    trafficPrefer: await tp.getBestTravelPolicy({placeId:toCity["id"], type: "trafficPrefer"}),
                                }
                            }
                        }
                        if(toCity.isAbroad){
                            policies = {
                                abroad:{
                                    cabin: await tp.getBestTravelPolicy({placeId:toCity["id"], type: "planeLevels"}),
                                    trafficPrefer: await tp.getBestTravelPolicy({placeId:toCity["id"], type: "trafficPrefer"}),
                                }
                            }
                        }
                    }
                    let trafficParams = {
                        policies: policies,
                        staffs: seg.staffs && seg.staffs.length ? seg.staffs : staffs,
                        fromCity: fromCity,
                        toCity: toCity,
                        latestArrivalTime: seg.beginTime,
                        earliestDepartTime: i > 0 ? segments[i-1].endTime: null,
                        preferSet,
                        tickets,
                        isRetMarkedData: isRetMarkedData,
                    }
                    tasks.push(ApiTravelBudget.getTrafficBudget(trafficParams));
                } else {
                    tasks.push(null);
                }

                //判断停留时间是否跨天
                let timezone = toCity.timezone || 'Asia/Shanghai';
                if (!seg.noHotel && countDays(seg.endTime, seg.beginTime, timezone) > 0) {
                    if(tp) {
                        if(toCity["isAbroad"]){
                            policies = {
                                abroad:{
                                    hotelStar: await tp.getBestTravelPolicy({placeId: toCity["id"], type: "hotelLevels"}),
                                    hotelPrefer: await tp.getBestTravelPolicy({placeId: toCity["id"], type: "hotelPrefer"}),
                                    maxPriceLimit: await tp.getBestTravelPolicy({placeId:toCity["id"], type: "maxPriceLimit"}),
                                    minPriceLimit: await tp.getBestTravelPolicy({placeId:toCity["id"], type: "minPriceLimit"}),
                                }
                            }
                        }
                        if(!toCity["isAbroad"]){
                            policies = {
                                domestic:{
                                    hotelStar: await tp.getBestTravelPolicy({placeId: toCity["id"], type: "hotelLevels"}),
                                    hotelPrefer: await tp.getBestTravelPolicy({placeId: toCity["id"], type: "hotelPrefer"}),
                                    maxPriceLimit: await tp.getBestTravelPolicy({placeId:toCity["id"], type: "maxPriceLimit"}),
                                    minPriceLimit: await tp.getBestTravelPolicy({placeId:toCity["id"], type: "minPriceLimit"}),
                                }
                            }
                        }
                    }
                    let checkOutDate = moment(seg.endTime).tz(timezone).format("YYYY-MM-DD")
                    let checkInDate = moment(seg.beginTime).tz(timezone).format("YYYY-MM-DD")
                    let days = moment(checkOutDate).diff(checkInDate, 'days');
                    let hotelParams = {
                        policies: policies,
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

    static _scheduleTask () {
        let taskId = "currencyExchangeRate";
        logger.info('run task ' + taskId);
        scheduler('0 0 8 * * *', taskId, async function() {
            let MAX_TRY = 3;
            let exchangeRate = [];
            for(let i =0; i < MAX_TRY; i++ ) {
                try{
                    exchangeRate = await requestExchangeRate();
                } catch(err) {
                    console.log("获取汇率失败")
                }
                if(exchangeRate && exchangeRate.length && typeof(exchangeRate) != 'undefined'){
                    break;
                }
            }
            if(exchangeRate && exchangeRate.length) {
                let rate;
                for(let i = 0; i< exchangeRate.length; i++){
                    if(exchangeRate[i]["currencyF"] == 'CNY') {
                        rate = exchangeRate[i]["exchange"] || exchangeRate[i]["result"]
                    }
                }
                if(rate) {
                    let params = {
                        currencyFromId: '4a66fb50-96a6-11e7-b929-cbb6f90690e1',  //人民币
                        currencyToId: '4a66fb51-96a6-11e7-b929-cbb6f90690e1',    //美元
                        postedDate: exchangeRate[0]["updateTime"],
                        rate: rate
                    };
                    let obj = ExchangeRate.create(params);
                    await obj.save();
                }
            }
        });
    }
}

ApiTravelBudget._scheduleTask();
export default  ApiTravelBudget;

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

async function requestExchangeRate():Promise<any>{
    let baseUrl = 'http://op.juhe.cn/onebox/exchange/currency';
    let qs: {
        [index:string]:string
    } = {
        from: "CNY",
        to: "USD",
        key: "58db4718504b1fa7a7448a8024c41864"
    }
    return new Promise<any>(async (resolve,reject) => {
        request({
            uri: baseUrl,
            qs: qs,
            json: true,
            method: "get"
        }, async function(err,res) {
            if(err) return reject(null);
            let body = res.body;
            if(typeof(res.body) == 'string') {
                body = JSON.parse(body);
            }
            if(body && body.result && body.error_code == 0) {
                return resolve(body.result);
            }
            return reject(null)
        });
    });

}

