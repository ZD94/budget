/*
 * @Author: Mr.He 
 * @Date: 2017-12-16 11:35:17 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2017-12-20 18:55:43
 * @content what is the content of this file. */

import { ICity, CityService } from '_types/city';
import { IPolicySet, IStaff, EAirCabin, EHotelStar } from "_types/budget";
import { getSuitablePrefer } from "api/prefer";
import { ECompanyRegionUsedType } from "_types/policy/companyRegion";
import { Models } from "_types/index";
import _ = require("lodash");
import { TravelPolicy, ForbiddenPlane, EPlaneLevel } from "_types/policy";
import { DEFAULT_PREFER_CONFIG_TYPE, loadPrefers } from "./prefer";
import L from '@jingli/language';
let moment = require("moment");
require("moment-timezone");
import { HotelPriceLimitType } from "_types/company";


export interface TrafficAllPreferParams {
    fromCity: ICity | string;
    toCity: ICity | string;
    companyId: string;
    travelPolicyId: string;
    staff: IStaff;
    latestArrivalTime: Date;     //最晚到达时间
    earliestDepartTime: Date;   //最早出发时间
}


export interface HotelAllPreferParams {
    toCity: ICity | string;
    companyId: string;
    travelPolicyId: string;
    staff: IStaff;
    checkInDate: Date;
    checkOutDate: Date;
    location?: {
        latitude: number;
        longitude: number;
    }
}



//获取一段行程 Allprefer 设置
export class GetAllPrefer {

    /* 获取交通行程所需全部打分参数 */
    async getTrafficAllPrefer(params: TrafficAllPreferParams) {
        let { fromCity, toCity, latestArrivalTime, earliestDepartTime, companyId, travelPolicyId, staff } = params;

        if (typeof fromCity == 'string') {
            fromCity = await CityService.getCity(fromCity);
        }
        if (typeof toCity == 'string') {
            toCity = await CityService.getCity(toCity);
        }

        /* 获取公司偏好最佳配置 */
        let preferSet = await getSuitablePrefer({
            companyId,
            placeId: toCity.id
        });

        /* 交通的差旅政策 */
        let policies;
        let tp = await Models.travelPolicy.get(travelPolicyId);
        if (!tp || typeof (tp) == 'undefined') {
            throw L.ERR.TRAVEL_POLICY_NOT_EXIST();
        }
        if (toCity.isAbroad) {
            policies = {
                abroad: {
                    cabin: await tp.getBestTravelPolicy({
                        placeId: toCity["id"],
                        type: "planeLevels",
                        companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                    }),
                    trafficPrefer: await tp.getBestTravelPolicy({
                        placeId: toCity["id"],
                        type: "trafficPrefer",
                        companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                    }),
                }
            }
        } else {
            policies = {
                domestic: {
                    cabin: await tp.getBestTravelPolicy({
                        placeId: toCity["id"],
                        type: "planeLevels",
                        companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                    }),
                    trainSeat: await tp.getBestTravelPolicy({
                        placeId: toCity["id"],
                        type: "trainLevels",
                        companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                    }),
                    trafficPrefer: await tp.getBestTravelPolicy({
                        placeId: toCity["id"],
                        type: "trafficPrefer",
                        companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                    }),
                }
            }
        }

        let dtimezone = toCity && toCity.timezone ? toCity.timezone : 'Asia/Shanghai';
        let leaveDate = moment(latestArrivalTime || earliestDepartTime).tz(dtimezone).format('YYYY-MM-DD');

        let staffPolicy = policies[staff.policy] || {};
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
                earliestLeaveDateTime: earliestDepartTime,
                latestArrivalDateTime: latestArrivalTime,
            }
        }

        let allPrefers;
        if ((<ICity>fromCity).isAbroad || (<ICity>toCity).isAbroad) {
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

        return allPrefers;
    }

    async getHotelAllPrefer(params: HotelAllPreferParams) {
        let { toCity, checkInDate, checkOutDate, companyId, travelPolicyId, staff, location } = params;
        if (typeof toCity == 'string') {
            toCity = await CityService.getCity(toCity);
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
        if (toCity.isAbroad) {
            policies = {
                abroad: {
                    hotelStar: await tp.getBestTravelPolicy({
                        placeId: toCity["id"],
                        type: "hotelLevels",
                        companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                    }),
                    hotelPrefer: await tp.getBestTravelPolicy({
                        placeId: toCity["id"],
                        type: "hotelPrefer",
                        companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                    }),
                }
            }
            policies['abroad'] = _.assign(policies['abroad'], await this.getHotelPriceLimit(toCity['id'], companyId, tp))
        } else {
            policies = {
                domestic: {
                    hotelStar: await tp.getBestTravelPolicy({
                        placeId: toCity["id"],
                        type: "hotelLevels",
                        companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                    }),
                    hotelPrefer: await tp.getBestTravelPolicy({
                        placeId: toCity["id"],
                        type: "hotelPrefer",
                        companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                    })
                }
            }
            policies['domestic'] = _.assign(policies['domestic'], await this.getHotelPriceLimit(toCity['id'], companyId, tp));
        }

        /* 获取偏好设置 */
        let preferSet = await getSuitablePrefer({ companyId, placeId: toCity["id"] });

        let key = DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_HOTEL;
        let companyPrefers = preferSet["hotel"];
        if (toCity.isAbroad) {
            key = DEFAULT_PREFER_CONFIG_TYPE.ABROAD_HOTEL
        }
        if (!companyPrefers) {
            companyPrefers = [];
        }

        if (!location) {
            location = {
                latitude: toCity.latitude,
                longitude: toCity.longitude
            }
        }

        let policyKey = staff.policy || 'domestic';
        let staffPolicy = policies[policyKey] || {};
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

        return allPrefers;
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
