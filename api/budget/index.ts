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
require("moment-timezone");
const cache = require("common/cache");
const utils = require("common/utils");
import _ = require("lodash");
var request = require("request");
let scheduler = require('common/scheduler');
import { CurrencyRate } from "_types/currency"
import { defaultCurrencyUnit, budget } from "model/budget";
import {
    TrafficBudgetStrategyFactory, HotelBudgetStrategyFactory
} from "model/budget/strategy/index";

import { DEFAULT_PREFER_CONFIG_TYPE, loadPrefers } from "model/budget/prefer";
import { Models } from "_types/index";
import { ICity, CityService } from "_types/city";
import { countDays } from "model/budget/helper";
var API = require("@jingli/dnode-api");
if (API.default) {
    API = API.default
}
import Logger from "@jingli/logger";
import { ModelInterface } from "../../common/model/interface";
import { Model } from "sequelize";
var logger = new Logger("budget");
import { PolicyRegionSubsidy } from "_types/policy/policyRegionSubsidy";
import { TravelPolicy, ForbiddenPlane, EPlaneLevel } from "_types/policy";
import config = require("@jingli/config");
import { HotelPriceLimitType } from "_types/company";
import { ECompanyRegionUsedType } from "_types/policy/companyRegion";
let haversine = require("haversine");
import { BudgetType, STEP, DataOrder } from 'model/budget/interface';
import getAllPrefer from 'model/budget/getAllPrefer';
import { Budget } from '_types/budget';
let md5 = require("md5");

export interface ISearchHotelParams {
    checkInDate: string;
    checkOutDate: string;
    cityId: string;
    location?: {
        latitude: number,
        longitude: number,
    }
}

export interface ISearchTicketParams {
    leaveDate: string;
    originPlaceId: string;
    destinationId: string;
}


class ApiTravelBudget {
    static __initHttpApp(app) {
        app.get("/deeplink", async (req, res, next) => {
            console.log(req.query.id);
            let bookItem = await Models.deeplink.get(req.query.id);
            let bookurl = bookItem['url'];
            res.jlReply({
                'bookurl': bookurl
            });
        });
    }

    static async getTravelPolicy(travelPolicyId: string, destinationId: string) {
        let tp = await Models.travelPolicy.get(travelPolicyId);
        return {
            cabin: await tp.getBestTravelPolicy({
                placeId: destinationId,
                type: "planeLevels",
                companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
            }),
            trainSeat: await tp.getBestTravelPolicy({
                placeId: destinationId,
                type: "trainLevels",
                companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
            }),
            trafficPrefer: await tp.getBestTravelPolicy({
                placeId: destinationId,
                type: "trafficPrefer",
                companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
            }),
            hotelStar: await tp.getBestTravelPolicy({
                placeId: destinationId,
                type: "hotelLevels",
                companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
            }),
            hotelPrefer: await tp.getBestTravelPolicy({
                placeId: destinationId,
                type: "hotelPrefer",
                companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
            })
        }
    }

    static async getHotelsData(params: ISearchHotelParams) {
        let { checkInDate, checkOutDate, cityId, location } = params;
        let city = await CityService.getCity(cityId);
        location = location || {
            latitude: city.latitude,
            longitude: city.longitude
        };
        params.location = location;

        let hotels = await budget.requestDataStore({
            type: BudgetType.HOTEL,
            channels: [],
            input: {
                checkInDate,
                checkOutDate,
                city: city.id,
                latitude: location.latitude,
                longitude: location.longitude
            },
            step: STEP.CACHE
        } as DataOrder);

        //computer the distance
        hotels.data.map((item) => {
            item.distance = haversine(location, {
                latitude: item.latitude,
                longitude: item.longitude
            }, { unit: "meter" });
            item.distance = Math.round(item.distance);
        });

        return hotels;
    }

    static async getTrafficsData(params: ISearchTicketParams) {
        let { leaveDate, originPlaceId, destinationId } = params;

        let newOriginPlace = await CityService.getCity({ cityId: originPlaceId });
        let newDestination = await CityService.getCity({ cityId: destinationId });

        if (newOriginPlace && newOriginPlace.id) originPlaceId = newOriginPlace.id;
        if (newDestination && newDestination.id) destinationId = newDestination.id;

        let tickets = await budget.requestDataStore({
            type: BudgetType.TRAFFICT,
            channels: [],
            input: {
                leaveDate: leaveDate,
                originPlace: originPlaceId,
                destination: destinationId
            },
            step: STEP.CACHE
        } as DataOrder);

        /* compute the discount */
        let fullPrice = await API.place.getFlightFullPrice({ originPlace: originPlaceId, destination: destinationId });

        tickets.data.map((item) => {

            //处理机票折扣信息
            if (item.type == ETrafficType.PLANE) {
                for (let agent of item.agents) {
                    for (let cabin of agent.cabins) {
                        let price = fullPrice ? (cabin.name == EAirCabin.ECONOMY ? fullPrice.EPrice : fullPrice.FPrice) : 0;
                        if (price) {
                            let discount = Math.round(cabin.price / price * 100) / 100;
                            discount = discount < 1 ? discount : 1;
                            cabin.discount = discount;
                        }
                    }
                }
            }
        });

        return tickets;
    }


    static async getSubsidyBudget(params: { subsidies: PolicyRegionSubsidy[], leaveDate: Date, goBackDate: Date, isHasBackSubsidy: boolean, preferedCurrency?: string, toCity: ICity }): Promise<any> {
        let { subsidies, leaveDate, goBackDate, isHasBackSubsidy, preferedCurrency, toCity } = params;
        let budget: any = null;
        let timezone = toCity ? (toCity.timezone || 'Asia/Shanghai') : 'Asia/Shanghai';
        if (subsidies && subsidies.length) {
            let goBackDay = goBackDate ? moment(goBackDate).tz(timezone).format("YYYY-MM-DD") : null;
            let leaveDay = leaveDate ? moment(leaveDate).tz(timezone).format("YYYY-MM-DD") : null;
            let days = 0;
            if (!goBackDay || !leaveDay || goBackDay == leaveDay) {
                days = 1;
            } else {
                days = moment(goBackDay).diff(leaveDay, 'days');
            }
            if (isHasBackSubsidy) { //解决如果只有住宿时最后一天补助无法加到返程目的地上
                days += 1;
            }

            let totalMoney = 0;
            if (days > 0) {
                let templates = [];
                for (let i = 0; i < subsidies.length; i++) {
                    let subsidyDay = Math.floor(days / subsidies[i].subsidyType.period);
                    let price = subsidies[i].subsidyMoney * subsidyDay;
                    totalMoney += price;
                    let subsidy = {
                        name: subsidies[i].subsidyType.name, period: subsidies[i].subsidyType.period,
                        money: subsidies[i].subsidyMoney, price: price, id: subsidies[i].id, subsidyType: subsidies[i].subsidyType
                    };
                    if (subsidyDay) {
                        templates.push(subsidy);
                    }
                }


                budget = {};
                budget.unit = preferedCurrency && typeof (preferedCurrency) != 'undefined' ? preferedCurrency : defaultCurrencyUnit;
                budget.fromDate = leaveDate;
                budget.endDate = (goBackDay == leaveDay || isHasBackSubsidy) ? goBackDate : moment(goBackDate).tz(timezone).add(-1, 'days').toDate();
                budget.price = totalMoney;
                budget.duringDays = days;
                budget.templates = templates;
                budget.type = EBudgetType.SUBSIDY;
                budget.timezone = timezone;
                if (preferedCurrency == defaultCurrencyUnit) {
                    budget.rate = 1;
                } else {
                    let rates = await Models.currencyRate.find({ where: { currencyTo: preferedCurrency }, order: [["postedAt", "desc"]] });
                    if (rates && rates.length) {
                        budget.rate = rates[0].rate;
                    } else {
                        budget.rate = 1;
                    }
                }

            }
        }
        return budget;
    }

    /*
    * content 判断是否可以生产过期预算
    */

    static async judgeExpriedBudget(params: { companyId?: string, expiredBudget?: boolean }): Promise<boolean> {
        let { companyId, expiredBudget } = params;
        let companyConfig = await Models.companyConfig.get(companyId);
        if (!companyConfig || !companyConfig.openExpiredBudget) {
            return false;
        }

        if (expiredBudget != undefined && expiredBudget == false) {
            return false;
        }

        return true;
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
    static async debugBudgetItem(params: { type: number, originData: IHotel[] | ITicket[], query: any, prefers: any[] }) {
        try {
            let result;
            let { query, prefers, type, originData } = params;
            query.prefers = prefers;
            if (type == 1) {
                let strategy = await TrafficBudgetStrategyFactory.getStrategy(query, { isRecord: false });
                result = await strategy.getResult(<ITicket[]>originData, STEP.CACHE)
            } else {
                let strategy = await HotelBudgetStrategyFactory.getStrategy(query, { isRecord: false });
                result = await strategy.getResult(<IHotel[]>originData, STEP.CACHE);
            }
            // result.prefers = prefers;
            result.markedData = result.markedScoreData;
            delete result.markedScoreData;
            return result;
        } catch (err) {
            console.error(err.stack);
            throw err;
        }

    }

}

export default ApiTravelBudget;

function handleBudgetResult(data: FinalBudgetResultInterface, isRetMarkedData: boolean): FinalBudgetResultInterface {
    let result;
    // let d = _.cloneDeep(data);
    let d = data;

    if (!isRetMarkedData) {
        result = d.budgets.map((v: SegmentBudgetItem) => {
            if (!v)
                return v;
            let hotelBudgets = v.hotel || [];
            let trafficBudgets = v.traffic || [];

            v.hotel = hotelBudgets.map((budget: IHotelBudgetItem) => {
                delete budget.prefers;
                delete budget.markedScoreData;
                return budget;
            });
            v.traffic = trafficBudgets.map((budget: ITrafficBudgetItem) => {
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