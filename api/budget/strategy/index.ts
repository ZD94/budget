/**
 * Created by wlh on 16/8/13.
 */

'use strict';
import {ticketPrefers, hotelPrefers} from '../prefer'
import {IPrefer} from '../prefer'
import {
    IHotel, IFinalHotel, IHotelBudgetItem, EHotelStar, EBudgetType, IFinalTicket, ITicket,
    ITrafficBudgetItem, ETrafficType, EAirCabin, ETrainSeat
} from "_types/budget";
import moment = require("moment");
import _ = require("lodash");
import {Models} from "_types/index";
import {defaultCurrencyUnit} from "../index"

export function formatTicketData(tickets: ITicket[]) : IFinalTicket[] {
    let _tickets : IFinalTicket[] = [];
    //把数据平铺
    for(var i=0, ii=tickets.length; i<ii; i++) {
        let agents = tickets[i].agents;
        for(var j=0, jj=agents.length; j < jj; j++) {
            let cabins = agents[j].cabins;
            for(var n = 0, nn=cabins.length; n< nn; n++) {
                let cabin = cabins[n];
                let _ticket = {
                    No: tickets[i].No,
                    departDateTime: tickets[i].departDateTime,
                    arrivalDateTime: tickets[i].arrivalDateTime,
                    originPlace: tickets[i].originPlace,
                    destination: tickets[i].destination,
                    originStation: tickets[i].originStation,
                    destinationStation: tickets[i].destinationStation,
                    agent: agents[j].name,
                    cabin: cabin.name,
                    price: cabin.price,
                    remainNum: cabin.remainNum,
                    bookUrl: agents[j].bookUrl,
                    duration: tickets[i].duration || ((new Date(tickets[i].arrivalDateTime).valueOf() - new Date(tickets[i].departDateTime).valueOf())/(60*1000)),
                    type: tickets[i].type,
                    stops: tickets[i].stops,
                    segs: tickets[i].segs,
                } as IFinalTicket
                if(_ticket.price && _ticket.price >= 0) {
                    _tickets.push(_ticket);
                }
            }
        }
    }
    return _tickets;
}

export function formatHotel(hotels: IHotel[]) : IFinalHotel[] {
    let _hotels: IFinalHotel[] = [];
    for(let i=0, ii=hotels.length; i<ii; i++) {
        let hotel = hotels[i]
        let agents = hotel.agents || hotel['agent'];
        if (!agents) {
            continue;
        }
        for(var j=0, jj=agents.length; j< jj; j++) {
            if(agents[j].price && agents[j].price >= 0) {
                _hotels.push({
                    name: hotel.name,
                    latitude: hotel.latitude,
                    longitude: hotel.longitude,
                    star: hotel.star,
                    price: agents[j].price,
                    bookUrl: agents[j].bookUrl,
                    agent: agents[j].name,
                    checkInDate: hotel.checkInDate,
                    checkOutDate: hotel.checkOutDate,
                    outPriceRange: false,
                    commentScore: hotel.commentScore,
                } as IFinalHotel)
            }
        }
    }
    return _hotels;
}

export abstract class AbstractHotelStrategy {
    private prefers: IPrefer<IFinalHotel>[];
    private isRecord: boolean;

    constructor(public qs: any, options: any) {
        if (options && options.isRecord) {
            this.isRecord = true;
        } else {
            this.isRecord = false;
        }
        this.prefers = [];
    }

    addPrefer(p: IPrefer<IFinalHotel>) {
        this.prefers.push(p);
    }

    async getMarkedScoreHotels(hotels: IFinalHotel[]) :Promise<IFinalHotel[]> {
        let self = this;
        for(let prefer of self.prefers) {
            hotels = await prefer.markScore(hotels);
        }
        return hotels;
    }

    abstract async customMarkedScoreData(hotels: IFinalHotel[]) :Promise<IFinalHotel[]>;

    async getResult(hotels: IHotel[], isRetMarkedData?: boolean, preferedCurrency?: string): Promise<IHotelBudgetItem> {
        let self = this;
        let _hotels = formatHotel(hotels);
        if ((!_hotels || !_hotels.length) && self.qs.city && !self.qs.city.isAbroad) {
            const defaultPrice = {
                "5": 500,
                "4": 450,
                "3": 400,
                "2": 350
            }
            let checkOutDate = moment(self.qs.checkOutDate).format("YYYY-MM-DD");
            let checkInDate = moment(self.qs.checkInDate).format("YYYY-MM-DD");
            let days = moment(checkOutDate).diff(checkInDate, 'days');
            return {
                city: self.qs.city ? self.qs.city.id : '',
                name: null,
                checkInDate: self.qs.checkInDate,
                checkOutDate: self.qs.checkOutDate,
                star: null,
                price: defaultPrice[this.qs.star] as number * days,
                unit: preferedCurrency && typeof(preferedCurrency) != 'undefined' ? preferedCurrency: defaultCurrencyUnit,
                rate: 1,
                agent: null,
                type: EBudgetType.HOTEL,
                latitude: 0,
                longitude: 0
            } as IHotelBudgetItem;
        }

        //没有预算
        if (!_hotels || !hotels.length) {
            return {
                city: self.qs.city ? self.qs.city.id : '',
                name: null,
                checkInDate: self.qs.checkInDate,
                checkOutDate: self.qs.checkOutDate,
                star: null,
                type: EBudgetType.HOTEL,
                latitude: 0,
                longitude: 0,
                price: -1,
                unit: preferedCurrency && typeof(preferedCurrency) != 'undefined' ? preferedCurrency: defaultCurrencyUnit,
                rate: 1
            }
        }


        _hotels = await this.getMarkedScoreHotels(_hotels);

        _hotels.sort( (v1, v2) => {
            return v2.score - v1.score;
        });
        _hotels = await this.customMarkedScoreData(_hotels);
        let ret = _hotels[0];
        let rate = 1;
        if(preferedCurrency && typeof(preferedCurrency) != 'undefined') {
            rate = await getExpectedCurrencyRate(preferedCurrency);
        }

        let result: any = {
            city: self.qs.city ? self.qs.city.id : '',
            checkInDate: self.qs.checkInDate,
            checkOutDate: self.qs.checkOutDate,
            price: ret.price,
            rate: rate,
            unit: preferedCurrency && typeof(preferedCurrency) != 'undefined' ? preferedCurrency: defaultCurrencyUnit,
            agent: ret.agent,
            name: ret.name,
            star: ret.star,
            latitude: ret.latitude,
            longitude: ret.longitude,
            bookurl: ret.bookUrl
        }

        if (self.isRecord) {
            //保存调试记录
            let budgetItem = Models.budgetItem.create({
                title: `${self.qs.city ? (self.qs.city.name? self.qs.city.name: result.city):result.city}(${moment(self.qs.checkInDate).format('YYYY-MM-DD')}-${moment(self.qs.checkOutDate).format('YYYY-MM-DD')})`,
                query: _.cloneDeep(self.qs),
                type: EBudgetType.HOTEL,
                originData: hotels,
                markedData: _hotels,
                result: result,
                prefers: self.qs.prefers,
            })
            budgetItem = await budgetItem.save();
            result.id = budgetItem.id;
        }

        if (isRetMarkedData) {
            result.markedScoreData = _hotels;
        }
        return result;
    }
}

export class CommonHotelStrategy extends AbstractHotelStrategy {

    constructor(public qs: any, options: any) {
        super(qs, options);
    }

    async customMarkedScoreData(hotels:IFinalHotel[]):Promise<IFinalHotel[]> {
        hotels.sort ( (v1, v2) => {
            let diff = v2.score - v1.score;
            if (diff) return diff;
            return v2.price - v1.price;
        })
        return hotels;
    }
}

export class HighPriceHotelStrategy extends AbstractHotelStrategy {

    constructor(public qs: any, options: any) {
        super(qs, options);
    }

    async customMarkedScoreData(hotels: IFinalHotel[]): Promise<IFinalHotel[]> {
        hotels.sort( (v1, v2) => {
            let diff = v2.score - v1.score;
            if (diff) return diff;
            return v1.price - v2.price;
        })
        return hotels;
    }
}

export abstract class AbstractTicketStrategy {
    private prefers: IPrefer<IFinalTicket>[];
    private isRecord: boolean;

    constructor(public qs: any, options: any) {
        if (options && options.isRecord) {
            this.isRecord = true;
        } else {
            this.isRecord = false;
        }

        this.prefers = [];
    }

    addPrefer(p: IPrefer<IFinalTicket>) {
        this.prefers.push(p);
    }

    async getMarkedScoreTickets(tickets: IFinalTicket[]): Promise<IFinalTicket[]> {
        let self = this;
        self.prefers.forEach( async (p) => {
            tickets =  await p.markScore(tickets)
        })
        return tickets;
    }

    abstract async customerMarkedScoreData(tickets: IFinalTicket[]): Promise<IFinalTicket[]>;

    async getResult(tickets: ITicket[], isRetMarkedData?: boolean, preferedCurrency?: string) :Promise<ITrafficBudgetItem> {
        let self = this;
        let _tickets = formatTicketData(tickets);
        if (!_tickets || !_tickets.length) {
            return {
                fromCity: self.qs.fromCity.id,
                toCity: self.qs.toCity.id,
                price: -1,
                rate: 1,
                unit: preferedCurrency && typeof(preferedCurrency) != 'undefined' ? preferedCurrency: defaultCurrencyUnit,
                departTime: new Date(),
                arrivalTime: new Date(),
                trafficType: ETrafficType.PLANE,
                type: EBudgetType.TRAFFIC,
                no: '',
            } as ITrafficBudgetItem;
        }

        _tickets = await this.getMarkedScoreTickets(_tickets);
        _tickets.sort( (v1, v2) => {
            return v2.score - v1.score;
        });
        _tickets = await this.customerMarkedScoreData(_tickets);
        let ret = _tickets[0];
        let rate = 1;
        if(preferedCurrency && typeof(preferedCurrency) != 'undefined') {
            rate = await getExpectedCurrencyRate(preferedCurrency);
        }
        let result: ITrafficBudgetItem = {
            price: ret.price,
            unit: preferedCurrency && typeof(preferedCurrency) != 'undefined' ? preferedCurrency: defaultCurrencyUnit,
            rate: rate,
            type: EBudgetType.TRAFFIC,
            no: ret.No,
            agent: ret.agent,
            cabin: <EAirCabin|ETrainSeat>Number(ret.cabin),
            fromCity: self.qs.fromCity.id,
            toCity: self.qs.toCity.id,
            departTime: new Date(ret.departDateTime),
            arrivalTime: new Date(ret.arrivalDateTime),
            trafficType: ret.type,
            bookurl: ret.bookUrl
        }

        if (self.isRecord) {
            //保存调试记录
            let budgetItem = Models.budgetItem.create({
                title: `${self.qs.fromCity.name}-${self.qs.toCity.name}(${moment(self.qs.departDateTime).format('YYYY/MM/DD')})`,
                query: _.cloneDeep(self.qs),
                type: EBudgetType.TRAFFIC,
                originData: tickets,
                markedData: _tickets,
                result: result,
                prefers: self.qs.prefers,
            })
            budgetItem = await budgetItem.save();
            result.id = budgetItem.id;
        }

        if (isRetMarkedData) {
            result.markedScoreData = _tickets;
        }
        return result;
    }
}

export class CommonTicketStrategy extends AbstractTicketStrategy {
    constructor(public query: any, options: any) {
        super(query, options);
    }

    async customerMarkedScoreData(tickets: IFinalTicket[]): Promise<IFinalTicket[]> {
        tickets.sort( (v1, v2) => {
            let diff = v2.score - v1.score;
            if (diff) return diff;
            return v1.price - v2.price;
        });
        return tickets;
    }
}

export class TrafficBudgetStrategyFactory {
    static async getStrategy(qs, options) {
        let prefers = qs.prefers || [];  //保存的是企业打分参数信息
        let strategy = new CommonTicketStrategy(qs, options);
        //通过企业配置的喜好打分
        for(let k of prefers) {
            k.options = k.options || {};
            // k.options.policies = qs.policies;

            let prefer = PreferFactory.getPrefer(k.name, k.options);
            if (!prefer) continue;
            strategy.addPrefer(prefer)
        }
        return strategy;
    }
}

export class HotelBudgetStrategyFactory {
    static async getStrategy(qs, options) {
        let prefers = qs.prefers || [];
        let strategy = new CommonHotelStrategy(qs, options);
        for(let p of prefers) {
            p.options = p.options || {};
            // p.options.policies = qs.policies;

            let prefer = PreferFactory.getPrefer(p.name, p.options, 'hotel');
            if (!prefer) continue;
            strategy.addPrefer(prefer);
        }
        return strategy;
    }
}

class PreferFactory {
    static getPrefer(name, options, type?: string) {
        let cls = type == 'hotel' ? hotelPrefers[name]: ticketPrefers[name];
        if (cls && typeof cls == 'function') {
            return new (cls)(name, options);
        }
        return null;
    }
}

async function getExpectedCurrencyRate(expectedCurrency: string) {
    //4a66fb50-96a6-11e7-b929-cbb6f90690e1 表示人民币
    let currencies = await Models.currency.find({where: {currencyCode: defaultCurrencyUnit}});
    let defaultCNYRate = 1;
    let defaultCurrencyFrom = defaultCurrencyUnit;
    // if(currencies && currencies.length) {
    //     if(currencies[0]['currencyCode'] == expectedCurrency) {
    //         return defaultCNYRate;
    //     }
    //     defaultCurrencyIdFrom = currencies[0]['id']
    // } else {
    //     return defaultCNYRate;
    // }


    currencies = await Models.currency.find({where: {currencyCode: expectedCurrency}});
    let expectedCurrencyTo = '';
    if(currencies && currencies.length) {
        expectedCurrencyTo = currencies[0]['currencyCode']
    } else {
        return defaultCNYRate;
    }
    let query = {
        where: {
            currencyFrom: defaultCurrencyFrom,
            currencyTo: expectedCurrencyTo,
        },
        order:[['postedAt', 'desc'], ['createdAt', 'desc']]
    };
    let rates = await Models.currencyRate.find(query);
    if(rates && rates.length) {
        return rates[0]['rate'];
    }
    return defaultCNYRate;
}

