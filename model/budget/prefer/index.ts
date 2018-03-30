/**
 * Created by wlh on 16/8/11.
 */

'use strict';
import _ = require("lodash");
// import Logger from '@jingli/logger';
import moment = require("moment");
// let logger = new Logger('travel-budget');
export {IPrefer, AbstractPrefer} from './AbstractPrefer';

export enum DEFAULT_PREFER_CONFIG_TYPE {
    ABROAD_TRAFFIC = 1,
    ABROAD_HOTEL = 2,
    DOMESTIC_TICKET = 3,
    DOMESTIC_HOTEL = 4,
}

export const sysPrefer = require("./default-prefer/sys-prefer.json");
export const defaultPrefer = require("./default-prefer/default-company-prefer.json");

export async function loadPrefers(prefers: any[], qs: { local: any }, type?: DEFAULT_PREFER_CONFIG_TYPE) {
    let defaultPrefers;
    let sysPrefers;
    switch (type) {
        case DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_HOTEL:
            sysPrefers = _.cloneDeep(sysPrefer.domesticHotel);
            defaultPrefers = _.cloneDeep(defaultPrefer.domesticHotel);
            prefers = await mergePrefers(defaultPrefers, prefers)
            
            defaultPrefers =await mergePrefers(sysPrefers, prefers, true);
            break;
        case DEFAULT_PREFER_CONFIG_TYPE.ABROAD_TRAFFIC:
            sysPrefers = _.cloneDeep(sysPrefer.abroadTraffic);  
            defaultPrefers = _.cloneDeep(defaultPrefer.abroadTraffic);
            prefers = await mergePrefers(defaultPrefers, prefers)

            defaultPrefers = await mergePrefers(sysPrefers, prefers, true);
            break;
        case DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_TICKET:
            sysPrefers = _.cloneDeep(sysPrefer.domesticTraffic);
            defaultPrefers = _.cloneDeep(defaultPrefer.domesticTraffic);
            prefers = await mergePrefers(defaultPrefers, prefers)
            
            defaultPrefers = await mergePrefers(sysPrefers, prefers, true);
            break;
        case DEFAULT_PREFER_CONFIG_TYPE.ABROAD_HOTEL:
            sysPrefers = _.cloneDeep(sysPrefer.abroadHotel);
            defaultPrefers = _.cloneDeep(defaultPrefer.abroadHotel);
            prefers = await mergePrefers(defaultPrefers, prefers)
            defaultPrefers = await mergePrefers(sysPrefers, prefers, true);
            break;
    }
    let _prefers = JSON.stringify(defaultPrefers);
    let _compiled = _.template(_prefers, { 'imports': { 'moment': moment } });
    let obj = JSON.parse(_compiled(qs));
    return obj;
}

export  async function  mergePrefers(prefers: any[], newPrefers: any[], isConcat?: boolean): Promise<any[]> {
    if(!newPrefers || !newPrefers.length) return prefers;
    if(!isConcat) {
        let preferNames: string[] = [];
        await Promise.all(newPrefers.map(async (prefer) => {
            preferNames.push(prefer.name)
        }));
    
        prefers = await Promise.all(prefers.map(async (prefer) => {
            if(preferNames.indexOf(prefer.name) > -1) return null;
            return prefer;
        }));
        prefers = prefers.filter((prefer) => {
            if(!prefer) return false;
            return true;
        });
    }
    
    return [...prefers, ...newPrefers];
}


export var hotelPrefers = {
    starMatch: require('./hotel-star-match'),
    blackList: require('./hotel-blacklist'),
    represent: require('./hotel-represent'),
    priceRange: require('./hotel-pricerange'),
    distance: require('./hotel-distance'),
    price: require('./price'),
    commentScore: require("./hotel-commentScore"),
    priceDeviationPunishment:require('./hotel-priceDeviationPunishment'),
    hotelBrand: require("./hotel-brandPrefer")
}

export var ticketPrefers = {
    arrivalTime: require('./ticket-arrivaltime'),
    departTime: require('./ticket-departtime'),
    cheapSupplier: require('./ticket-cheapsupplier'),
    cabin: require('./ticket-cabin'),
    runningTimePrefer: require('./ticket-runningTimePrefer'),
    departStandardTimePrefer: require('./ticket-departStandardTimePrefer'),
    arriveStandardTimePrefer: require('./ticket-arriveStandardTimePrefer'),
    trainDurationPrefer: require('./ticket-trainDurationPrefer'),
    latestArrivalTimePrefer: require('./ticket-latestArrivalTimePrefer'),
    earliestGoBackTimePrefer: require('./ticket-earliestGoBackTimePrefer'),
    trainPricePrefer: require('./ticket-trainPricePrefer'),
    planePricePrefer: require('./price'),
    price: require('./price'),
    planeNumberPrefer: require('./ticket-planeNumberPrefer'),
    permitOnlySupplier: require('./ticket-permitOnlySupplier'),
    planeStop: require('./ticket-stopping'),
    // priorSupplier: require('./ticket-priorSupplier'),
    directArrive: require('./ticket-directArrive'),
    transitWaitDuration: require('./ticket-transitWaitDurationPrefer'),
    transitCityInChina: require("./ticket-transitCityInChinaPrefer"),
    compareTrainPlanPrice: require("./ticket-compareTrainPlanPrice"),
    refusedPlane: require("./ticket-refusedPlane"),
    preferAirCompany: require("./ticket-preferaircompany")
}