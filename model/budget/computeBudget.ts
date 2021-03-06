/*
 * @Author: Mr.He 
 * @Date: 2017-12-22 10:56:07 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-02-07 16:25:02
 * @content 计算预算 */

import { BudgetType, BudgetOrder,SearchHotelParams, SearchTicketParams, defaultCurrencyUnit, DataOrder } from "./interface";
import { ICity, CityService } from '_types/city';
import { IHotelBudgetItem, ITrafficBudgetItem, EBudgetType, ETrafficType, EAirCabin } from "_types/budget";
import {TrafficBudgetStrategyFactory, HotelBudgetStrategyFactory} from "model/budget";
export var NoCityPriceLimit = 0;
var API = require("@jingli/dnode-api");
if (API.default) {
    API = API.default
}
import moment = require("moment");

export class ComputeBudget {
    async getBudget(params: DataOrder, persons: number,budgetOrder:BudgetOrder) {
        let transParams = {
            prefer: params.prefer,
            data: params.data,
            days: params.days || 0,
            step: params.step
        }
        for (let key in params.input) {
            transParams[key] = params.input[key];
        }
        if (params.type == BudgetType.TRAFFICT) {
            //入口
            return await this.getTrafficBudget(transParams, persons,budgetOrder);
        } else {
            return await this.getHotelBudget(transParams, persons,budgetOrder);
        }
    }

    async getHotelBudget(params, persons: number,budgetOrder:BudgetOrder): Promise<IHotelBudgetItem> {
        let { checkInDate, checkOutDate, city, location, data, prefer, days, selectAddress } = params;
        if (typeof city == "string") {
            city = await CityService.getCity(city);
        }

        let strategy = await HotelBudgetStrategyFactory.getStrategy({
            star: prefer.star,
            checkInDate,
            checkOutDate,
            prefers: prefer.allPrefers,
            city: city,
            location,
        }, { isRecord: true });

        let budget = await strategy.getResult(data, params.step,budgetOrder);

        budget.price = this.limitHotelBudgetByPrefer(prefer.policies.minPriceLimit * days, prefer.policies.maxPriceLimit * days, budget.price);

        let hotelBudget: IHotelBudgetItem = {
            id: budget.id,
            commentScore: budget.commentScore,
            checkInDate: params.checkInDate,
            checkOutDate: params.checkOutDate,
            city: (<ICity>city).id,
            star: budget.star,
            singlePrice: budget.price,
            price: budget.price *  persons,
            duringDays: days,
            type: EBudgetType.HOTEL,
            name: budget.name,
            selectAddress,
            agent: budget.agent,
            link: budget.link,
            markedScoreData: budget.markedScoreData,
            prefers: prefer.allPrefers,
            deeplinkData: budget.deeplinkData,
            bookurl: budget.bookurl,
            latitude: budget.latitude,
            longitude: budget.longitude,
            landmark: budget.landmark
        }
        return hotelBudget;
    }

    limitHotelBudgetByPrefer(min: number, max: number, hotelBudget: number) {
        //无预算的情况
        if (hotelBudget < 0) {
            return min || max || hotelBudget;
        }

        if (min) {
            return hotelBudget > min ? hotelBudget : min;
        }

        if (max) {
            return hotelBudget < max ? hotelBudget : max;
        }

        return hotelBudget;
    }

    async getTrafficBudget(params, persons: number,budgetOrder:BudgetOrder): Promise<ITrafficBudgetItem> {
        let {
            originPlace: fromCity,
            destination: toCity,
            earliestGoBackDateTime: earliestDepartTime,
            latestArrivalDateTime: latestArrivalTime,
            prefer,
            data,
            staff
        } = params;

        if (typeof fromCity == 'string') {
            fromCity = await CityService.getCity(fromCity);
        }
        if (typeof toCity == 'string') {
            toCity = await CityService.getCity(toCity);
        }

        let policies = prefer.policies,
            allPrefers = prefer.allPrefers;
        let strategy = await TrafficBudgetStrategyFactory.getStrategy({
            fromCity,
            toCity,
            latestArrivalTime,
            earliestDepartTime,
            policies,
            prefers: allPrefers,
            data,
            staffs: [staff],
        }, { isRecord: true });
        let budget = await strategy.getResult(data, params.step,budgetOrder);

        let discount = 0;
        if (budget.trafficType == ETrafficType.PLANE) {
            console.log("API.place====>", API.place);
            let fullPrice = await API.place.getFlightFullPrice({ originPlace: budget.fromCity, destination: budget.toCity });
            let price = fullPrice ? (EAirCabin.ECONOMY ? fullPrice.EPrice : fullPrice.FPrice) : 0;
            if (price) {
                discount = Math.round(budget.price / price * 100) / 100;
                discount = discount < 1 ? discount : 1;
            }
        }

        let trafficBudget: ITrafficBudgetItem = {
            id: budget.id,
            no: budget.no,
            agent: budget.agent,
            carry: budget.carry,
            departTime: budget.departTime,
            arrivalTime: budget.arrivalTime,
            trafficType: budget.trafficType,
            cabin: budget.cabin,
            fromCity: budget.fromCity,
            toCity: budget.toCity,
            type: EBudgetType.TRAFFIC,
            singlePrice: budget.price,
            price: budget.price * persons,
            discount: discount,
            markedScoreData: budget.markedScoreData,
            prefers: allPrefers,
            bookurl: budget.bookurl,
            deeplinkData: budget.deeplinkData,
            destinationStation: budget.destinationStation,
            originStation: budget.originStation,
            segs: budget.segs
        }

        return trafficBudget as ITrafficBudgetItem;
    }
}

let computeBudget = new ComputeBudget();
export default computeBudget;