/*
 * @Author: Mr.He 
 * @Date: 2017-12-22 10:56:07 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-01-17 16:16:33
 * @content 计算预算 */

import { BudgetType, SearchHotelParams, SearchTicketParams, defaultCurrencyUnit, DataOrder } from "./interface";
import { ICity, CityService } from '_types/city';
import { IHotelBudgetItem, ITrafficBudgetItem, EBudgetType, ETrafficType, EAirCabin } from "_types/budget";
import { TrafficBudgetStrategyFactory, HotelBudgetStrategyFactory } from "model/budget";
export var NoCityPriceLimit = 0;
var API = require("@jingli/dnode-api");
import moment = require("moment");

export class ComputeBudget {
    async getBudget(params: DataOrder) {
        let transParams = {
            prefer: params.prefer,
            data: params.data
        }
        for (let key in params.input) {
            transParams[key] = params.input[key];
        }
        if (params.type == BudgetType.TRAFFICT) {
            return await this.getTrafficBudget(transParams);
        } else {
            return await this.getHotelBudget(transParams);
        }
    }

    async getHotelBudget(params): Promise<IHotelBudgetItem> {
        let { checkInDate, checkOutDate, city, location, data, prefer } = params;
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

        let preferedCurrency = defaultCurrencyUnit;
        let isRetMarkedData = true;
        let budget = await strategy.getResult(data, isRetMarkedData, preferedCurrency);

        let maxPriceLimit = 0;
        let minPriceLimit = 0;
        let days: number = 0;

        let beginTime = moment(checkInDate).hour(12);
        let endTime = moment(checkOutDate).hour(12);
        days = moment(endTime).diff(beginTime, 'days');

        let selector: string;
        if (!city['isAbroad']) {
            selector = 'domestic'
        } else {
            selector = 'abroad';
        }

        let policies = prefer.policies;

        maxPriceLimit = policies[selector].maxPriceLimit;
        minPriceLimit = policies[selector].minPriceLimit;
        budget.price = this.limitHotelBudgetByPrefer(minPriceLimit * days, maxPriceLimit * days, budget.price);

        let hotelBudget: IHotelBudgetItem = {
            id: budget.id,
            commentScore: budget.commentScore,
            checkInDate: params.checkInDate,
            checkOutDate: params.checkOutDate,
            city: (<ICity>city).id,
            star: budget.star,
            price: budget.price,
            unit: budget.unit,
            rate: budget.rate,
            type: EBudgetType.HOTEL,
            name: budget.name,
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
        if (hotelBudget == -1) {
            if (max != NoCityPriceLimit) return max;
            return hotelBudget;
        }
        if (min == NoCityPriceLimit && max == NoCityPriceLimit) return hotelBudget;

        if (max != NoCityPriceLimit && min > max) {
            let tmp = min;
            min = max;
            max = tmp;
        }

        if (hotelBudget > max) {
            if (max != NoCityPriceLimit) return max;
        }
        if (hotelBudget < min) {
            if (min != NoCityPriceLimit) return min;
        }
        return hotelBudget;
    }

    async getTrafficBudget(params): Promise<ITrafficBudgetItem> {
        let { originPlace: fromCity, destination: toCity, earliestGoBackDateTime: earliestDepartTime, latestArrivalDateTime: latestArrivalTime, prefer, data, staff } = params;

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

        let preferedCurrency = defaultCurrencyUnit;
        let isRetMarkedData = true;
        let budget = await strategy.getResult(data, isRetMarkedData, preferedCurrency);

        let discount = 0;
        if (budget.trafficType == ETrafficType.PLANE) {
            let fullPrice = await API.place.getFlightFullPrice({ originPlace: budget.fromCity, destination: budget.toCity });
            let price = fullPrice ? (EAirCabin.ECONOMY ? fullPrice.EPrice : fullPrice.FPrice) : 0;
            if (price) {
                discount = Math.round(budget.price / price * 100) / 100
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
            price: budget.price,
            unit: budget.unit,
            rate: budget.rate,
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