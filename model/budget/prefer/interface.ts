
/**
 * Created by wlh on 2018/3/8.
 */
'use strict';
const config = require("@jingli/config");

export interface ICity {
    name: string;
    id: string;
    isAbroad: boolean;
    letter: string;
    timezone: string;
    longitude: number;
    latitude: number;
    code?: string;  //三字码
    parentId: string;
    pinyin: string;
    countryCode: string;
    fcode: string;
    ctripCode?: string;
}

export enum ETrainSeat {
    BUSINESS_SEAT = 1,
    FIRST_SEAT = 2,
    SECOND_SEAT = 3,
    PRINCIPAL_SEAT = 4,
    SENIOR_SOFT_SLEEPER = 5,
    SOFT_SLEEPER = 6,
    HARD_SLEEPER = 7,
    SOFT_SEAT = 8,
    HARD_SEAT = 9,
    NO_SEAT = 10,
}
export interface IFinalHotel {
    name: string;
    latitude: string;
    longitude: string;
    star: number;
    agent: string;
    price: number;
    bookUrl?: string;
    deeplinkData?: object;
    score?: number;
    reasons?: string[];
    checkInDate: string;
    checkOutDate: string;
    outPriceRange: boolean;
    commentScore?: number;
}

export interface IFinalTicket {
    No: string;   //航班号或者车次
    departDateTime: string; //出发时间
    arrivalDateTime: string;    //到达时间
    originPlace: string;    //出发城市
    destination: string;    //目的地
    duration: number;
    originStation?: string; //出发机场或者车站
    destinationStation?: string;    //目的地机场或者车站
    type: ETrafficType,
    agent: string;
    cabin: string;
    price: number;
    score?: number;
    reasons?: string[];
    stops?: string[];
    segs?: any[];
    bookUrl?: string;
    deeplinkData?: object;
    carry?: string;
}

export enum ETrafficType {
    TRAIN = 0,
    PLANE = 1,
    SHIP = 2,
    CAR = 3,
    BUS = 4,
    SELF_DRIVER = 5,
    CAR_RENT = 6,
}

export enum EHotelStar {
    FIVE = 5,
    FOUR = 4,
    THREE = 3,
    TOW = 2,
}
export interface IFlightSeg {
    deptAirport: IAirport,
    arriAirport: IAirport,
    deptDateTime: Date,
    arriDateTime: Date,
    craft: ICraft;
    base: {
        flgno: string,
        aircode: string,
        logourl: string,
        airsname: string,
        ishared: boolean,
    }
}


export interface ICraft {
    kind: string;
    series: string;
    name: string;
}

export interface IAirport {
    name: string;
    city: string;
    code: string;
    bname: string;
}




