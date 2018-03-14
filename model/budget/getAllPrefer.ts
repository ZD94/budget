/*
 * @Author: Mr.He 
 * @Date: 2017-12-16 11:35:17 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-01-29 10:53:35
 * @content what is the content of this file. */

import { ICity, CityService } from '_types/city';
import { IPolicySet, IStaff, EAirCabin, EHotelStar } from "_types/budget";
import { getSuitablePrefer } from "./getCompanyPrefer";
import { ECompanyRegionUsedType } from "_types/policy/companyRegion";
import { Models } from "_types/index";
import _ = require("lodash");
import { TravelPolicy, ForbiddenPlane, EPlaneLevel } from "_types/policy";
import { DEFAULT_PREFER_CONFIG_TYPE, loadPrefers } from "./prefer";
import L from '@jingli/language';
let moment = require("moment");
require("moment-timezone");
import { HotelPriceLimitType } from "_types/company";
import { BudgetType, SearchHotelParams, SearchTicketParams, SearchSubsidyParams, TripType } from "./interface";


export interface AllPreferParams {
    companyId: string;
    travelPolicyId: string;
    type: BudgetType;
    input: SearchHotelParams | SearchTicketParams | SearchSubsidyParams;
    backOrGo: TripType;
}


export interface TrafficPreferParams extends AllPreferParams {
    originPlace: ICity | string;
    destination: ICity | string;
    latestArrivalDateTime: Date;     //最晚到达时间
    earliestGoBackDateTime: Date;    //最早出发时间
}


export interface HotelPreferParams extends AllPreferParams {
    city: ICity | string;
    checkInDate: Date;
    checkOutDate: Date;
    location?: {
        latitude: number;
        longitude: number;
    }
}



//获取一段行程 Allprefer 设置
export class GetAllPrefer {

    async getPrefer(params: AllPreferParams) {
        let { companyId, travelPolicyId, input, type } = params;

        // console.log("getPrefer =====> ", params);
        for (let key in input) {
            params[key] = input[key];
        }
        if (type == BudgetType.TRAFFICT) {
            let obj = params as TrafficPreferParams;
            return await this.getTrafficAllPrefer(obj);
        } else {
            let obj = params as HotelPreferParams;
            return await this.getHotelAllPrefer(obj);
        }
    }

    /* 获取交通行程所需全部打分参数 */
    async getTrafficAllPrefer(params: TrafficPreferParams) {
        let { originPlace, destination, latestArrivalDateTime, earliestGoBackDateTime, companyId, travelPolicyId, backOrGo } = params;

        if (typeof originPlace == 'string') {
            originPlace = await CityService.getCity(originPlace);
        }
        if (typeof destination == 'string') {
            destination = await CityService.getCity(destination);
        }

        /* 获取公司偏好最佳配置 */
        let preferSet = await getSuitablePrefer({
            companyId,
            placeId: destination.id
        });
        //由于prefer赋值问题，暂时关闭company单独设置，启用company默认设置
        preferSet = [];

        /* 交通的差旅政策 */
        let policies;
        let tp = await Models.travelPolicy.get(travelPolicyId);
        if (!tp || typeof (tp) == 'undefined') {
            throw L.ERR.TRAVEL_POLICY_NOT_EXIST();
        }
        if (destination.isAbroad) {
            policies = {
                cabin: await tp.getBestTravelPolicy({
                    placeId: destination["id"],
                    type: "planeLevels",
                    companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                }),
                trafficPrefer: await tp.getBestTravelPolicy({
                    placeId: destination["id"],
                    type: "trafficPrefer",
                    companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                }),
            }
        } else {
            policies = {
                cabin: await tp.getBestTravelPolicy({
                    placeId: destination["id"],
                    type: "planeLevels",
                    companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                }),
                trainSeat: await tp.getBestTravelPolicy({
                    placeId: destination["id"],
                    type: "trainLevels",
                    companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                }),
                trafficPrefer: await tp.getBestTravelPolicy({
                    placeId: destination["id"],
                    type: "trafficPrefer",
                    companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                }),
            }
        }

        let dtimezone = destination && destination.timezone ? destination.timezone : 'Asia/Shanghai';
        let leaveDate = moment( (backOrGo == TripType.GoTrip ?latestArrivalDateTime: earliestGoBackDateTime)).tz(dtimezone).format('YYYY-MM-DD');

        let staffPolicy = policies || {};
        let trainSeat = staffPolicy.trainSeat;
        let cabin = staffPolicy.cabin;

        let isForbiddenByPlane = cabin && _.isArray(cabin) && cabin.indexOf(ForbiddenPlane) >= 0 ? true : false;
        if (isForbiddenByPlane) {
            cabin = [EAirCabin.ECONOMY];
        }
        let qs = {
            local: {
                expectTrainCabins: trainSeat,
                expectFlightCabins: cabin,
                leaveDate: leaveDate,
                earliestLeaveDateTime: earliestGoBackDateTime,
                latestArrivalDateTime: latestArrivalDateTime,
            }
        }

        let allPrefers;
        if ((<ICity>originPlace).isAbroad || (<ICity>destination).isAbroad) {
            let key = DEFAULT_PREFER_CONFIG_TYPE.ABROAD_TRAFFIC;
            allPrefers = loadPrefers(preferSet["traffic"] || [], qs, key)
        } else {
            let key = DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_TICKET;
            allPrefers = loadPrefers(preferSet["traffic"] || [], qs, key)
        }
        //追加员工特殊偏好
        if (typeof staffPolicy.trafficPrefer == 'number' && staffPolicy.trafficPrefer >= 0) {
            [EAirCabin.BUSINESS, EAirCabin.ECONOMY, EAirCabin.FIRST, EAirCabin.PREMIUM_ECONOMY].forEach((cabin) => {
                let pref = {
                    "name": "price",
                    "options": { "type": "square", "score": 50000, "level": [cabin], "percent": staffPolicy.trafficPrefer / 100 }
                };
                for (let i = 0; i < allPrefers.length; i++) {
                    if (allPrefers[i].name == pref.name && allPrefers[i].options.level[0] == pref.options.level[0]) {
                        allPrefers.splice(i, 1, pref);
                    }
                }
            });
        }
        //追加是否允许乘坐飞机
        if (isForbiddenByPlane) {
            allPrefers.push({
                "name": "refusedPlane",
                "options": { "type": "square", "score": -1000000, "percent": 0 }
            })
        }

        return { allPrefers, policies };
    }

    /* 获取住宿行程所需全部打分参数 */
    async getHotelAllPrefer(params: HotelPreferParams) {
        let { city, checkInDate, checkOutDate, companyId, travelPolicyId, location } = params;
        if (typeof city == 'string') {
            city = await CityService.getCity(city);
        }
        let tp: TravelPolicy;
        if (travelPolicyId) {
            tp = await Models.travelPolicy.get(travelPolicyId);
        }
        if (!tp || typeof (tp) == 'undefined') {
            throw L.ERR.TRAVEL_POLICY_NOT_EXIST();
        }

        //获取差旅政策
        let policies: any = {};
        if (city.isAbroad) {
            policies = {
                hotelStar: await tp.getBestTravelPolicy({
                    placeId: city["id"],
                    type: "hotelLevels",
                    companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                }),
                hotelPrefer: await tp.getBestTravelPolicy({
                    placeId: city["id"],
                    type: "hotelPrefer",
                    companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                }),
            }
            policies = _.assign(policies, await this.getHotelPriceLimit(city['id'], companyId, tp))
        } else {
            policies = {
                hotelStar: await tp.getBestTravelPolicy({
                    placeId: city["id"],
                    type: "hotelLevels",
                    companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                }),
                hotelPrefer: await tp.getBestTravelPolicy({
                    placeId: city["id"],
                    type: "hotelPrefer",
                    companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                })
            }
            policies = _.assign(policies, await this.getHotelPriceLimit(city['id'], companyId, tp));
        }

        /* 获取偏好设置 */
        let preferSet = await getSuitablePrefer({ companyId, placeId: city["id"] });

        let key = DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_HOTEL;
        let companyPrefers = preferSet["hotel"];
        if (city.isAbroad) {
            key = DEFAULT_PREFER_CONFIG_TYPE.ABROAD_HOTEL
        }
        if (!companyPrefers) {
            companyPrefers = [];
        }

        if (!location) {
            location = {
                latitude: city.latitude,
                longitude: city.longitude
            }
        }

        let staffPolicy = policies || {};
        let star = staffPolicy.hotelStar;
        let allPrefers = loadPrefers(companyPrefers, {
            local: {
                checkInDate,
                checkOutDate,
                star,
                latitude: location.latitude,
                longitude: location.longitude,
            }
        }, key);

        //追加员工设置的标准
        if (typeof staffPolicy.hotelPrefer == 'number' && staffPolicy.hotelPrefer >= 0) {
            [EHotelStar.FIVE, EHotelStar.FOUR, EHotelStar.THREE, EHotelStar.TOW].forEach((star) => {
                let pref = {
                    "name": "price",
                    "options": { "type": "square", "score": 50000, "level": [star], "percent": staffPolicy.hotelPrefer / 100 }
                };
                for (let i = 0; i < allPrefers.length; i++) {
                    if (allPrefers[i].name == pref.name && allPrefers[i].options.level[0] == pref.options.level[0]) {
                        allPrefers.splice(i, 1, pref);
                    }
                }
            })
        }

        return { allPrefers, star, policies };
    }

    async getHotelPriceLimit(placeId: string, companyId: string, tp: TravelPolicy) {
        let hotelPrice: any = {
            maxPriceLimit: null,
            minPriceLimit: null
        };
        if (!companyId || typeof (companyId) == 'undefined') {
            return hotelPrice;
        }
        let company = await Models.company.get(companyId);
        switch (company.priceLimitType) {
            case HotelPriceLimitType.Max_Price_Limit:
                hotelPrice.maxPriceLimit = await tp.getBestTravelPolicy({
                    placeId: placeId,
                    type: "maxPriceLimit",
                    companyRegionType: ECompanyRegionUsedType.CITY_PRICE_LIMIT
                });
                hotelPrice.minPriceLimit = null;
                break;
            case HotelPriceLimitType.Min_Price_Limit:
                hotelPrice.maxPriceLimit = null;
                hotelPrice.minPriceLimit = await tp.getBestTravelPolicy({
                    placeId: placeId,
                    type: "minPriceLimit",
                    companyRegionType: ECompanyRegionUsedType.CITY_PRICE_LIMIT
                });
                break;
            case HotelPriceLimitType.Price_Limit_Both:
                hotelPrice.maxPriceLimit = await tp.getBestTravelPolicy({
                    placeId: placeId,
                    type: "maxPriceLimit",
                    companyRegionType: ECompanyRegionUsedType.CITY_PRICE_LIMIT
                });
                hotelPrice.minPriceLimit = await tp.getBestTravelPolicy({
                    placeId: placeId,
                    type: "minPriceLimit",
                    companyRegionType: ECompanyRegionUsedType.CITY_PRICE_LIMIT
                });
                break;
        }
        return hotelPrice;
    }
}

let getAllPrefer = new GetAllPrefer();
export default getAllPrefer;
