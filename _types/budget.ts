/**
 * Created by wlh on 2017/3/13.
 */

'use strict';

import { ICity } from '_types/city';
import { ModelObject } from "common/model/object";
import { Table, Field, Create } from "common/model/common";
import { Models } from "_types/index";
import uuid = require("uuid");
import { Types } from "../common/model/index";
import { GetBudgetParams, BudgetFinallyResult } from "model/budget"

export enum EShipCabin {
}

export enum EAirCabin {
    ECONOMY = 2,
    FIRST = 3,
    BUSINESS = 4,
    PREMIUM_ECONOMY = 5,    //高端经济仓
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

export enum EHotelStar {
    FIVE = 5,
    FOUR = 4,
    THREE = 3,
    TOW = 2,
}

export enum EGender {
    MALE = 1,
    FEMALE = 2
}

export var EGenderStr = {
    1: '男',
    2: '女'
}

export interface IAuthParams {
    appid: string;
    timestamp: string;
    sign: string;
}

//代理商
export interface IAgent {
    name: string;
    bookUrl?: string;    //预订链接
    price: number;
    deeplinkData?: object  //bookUrl需要的数据
}

//酒店代理商
export interface IHotelAgent extends IAgent {
}

//酒店
export interface IHotel {
    name: string;
    latitude: string;
    longitude: string;
    agents: Array<IHotelAgent>;
    star: string | number;
    checkInDate: string;
    checkOutDate: string;
    commentScore?: number;
}

export {IFinalHotel} from 'model/budget/prefer/interface';

export interface IQueryHotelBudgetParams {
    city: ICity | string;
    checkInDate: Date;
    checkOutDate: Date;
    policies: IPolicySet;
    staffs: IStaff[];
    companyId?: string;
    travelPolicyId?: string;
    hotels?: IHotel[];
    combineRoom?: boolean;
    isRetMarkedData?: boolean;
    expiredBudget: boolean;
    location?: {
        latitude: number,
        longitude: number,
    },
    preferedCurrency?: string
    budgetItemId: string;       //预算, 单项cacheId  
    orderId: string;            //Budget orderId   
}

//仓位信息
export interface ICabin {
    name: string;
    price: number;
    remainNum?: number;
}

export interface IFlightAgent extends IAgent {
    cabins: Array<ICabin>
}

export interface ITicket {
    No: string;   //航班号或者车次
    agents: Array<IFlightAgent>,   //代理商
    departDateTime: string; //出发时间
    arrivalDateTime: string;    //到达时间
    originPlace: string;    //出发城市
    destination: string;    //目的地
    duration: number;
    originStation?: string; //出发机场或者车站
    destinationStation?: string;    //目的地机场或者车站
    type: ETrafficType,
    stops?: string[],   //中转城市
    segs?: ISegment[],
    carry?: string
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

export interface IQueryTrafficBudgetParams {
    fromCity: ICity | string;
    toCity: ICity | string;
    companyId?: string;
    travelPolicyId?: string;
    policies: IPolicySet;
    staffs: IStaff[];
    latestArrivalTime: Date;     //最晚到达时间
    tickets?: ITicket[];
    isRetMarkedData?: boolean;
    earliestDepartTime?: Date;   //最早出发时间
    preferedCurrency?: string;
    expiredBudget?: boolean;
    budgetItemId: string;       //预算, 单项cacheId
    orderId: string;            //Budget orderId   
}

export interface IQueryBudgetParams {
    fromCity?: ICity | string;       //出发城市
    backCity?: ICity | string;       //返回城市
    segments: ISegment[];      //每段查询条件
    ret: boolean;       //是否往返
    staffs: IStaff[];  //出差员工
    policies?: IPolicySet;     //可能用到的全部差旅标准
    travelPolicyId?: string;
    companyId?: string;
    expiredBudget?: boolean;  //过期是否可以生成预算
    combineRoom?: boolean;   //同性是否合并
    tickets?: ITicket[];
    hotels?: IHotel[];
    isRetMarkedData?: boolean;
    preferedCurrency?: string;
    orderId?: string;        //缓存单次预算id
}

export interface PreferSet {
    [index: string]: IPrefer[]
}

export interface ISegment {
    city: ICity | string;    //目的地
    beginTime: Date;   //事务开始时间
    endTime: Date; //事务结束时间
    location?: ILocation; //经纬度，如果不存在使用城市经纬度
    noHotel?: boolean;  //是否需要住宿
    noTraffic?: boolean;    //是否需要交通
    staffs?: IStaff[];  //指定本段参与员工
}

export interface ILocation {
    longitude: number; //国际标准
    latitude: number;  //国际标准
    // name?: string;  //住宿点
}

export interface IStaff {
    gender: EGender,          //性别
}

export interface IPolicySet {
    [key: string]: IPolicy
}

export interface IPolicy {
    cabin?: Array<EAirCabin>;           //飞机
    trainSeat?: Array<ETrainSeat>;      //火车
    hotelStar?: Array<EHotelStar>;      //酒店
    shipCabin?: Array<EShipCabin>;      //轮船
    hotelPrefer?: number;               //住宿价格偏好值 (0 到 100) 默认 -1
    trafficPrefer?: number;             //交通价格偏好值 0 - 100 默认 -1
    maxPriceLimit?: number;
    minPriceLimit?: number;
}

export interface IBudgetItem {
    price: number;
    singlePrice: number;     //单价(每人每次)
    currency?: string;       //币种
    rate?: number;           //汇率
    type: EBudgetType;
    link?: string;
    agent?: string;
    markedScoreData?: any;
    prefers?: any;
    id?: string;
}

export enum EBudgetType {
    TRAFFIC = 1,
    HOTEL = 2,
    SUBSIDY = 3
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

export interface ITrafficBudgetItem extends IBudgetItem {
    fromCity: string;                           //出发城市
    toCity: string;                        //目的城市
    departTime: Date;
    arrivalTime: Date;
    leaveDate?: string;                     //用户选择的离开时间
    trafficType: ETrafficType;                  //交通类别,飞机、火车、轮船、大巴、打车或者自驾,租车
    cabin?: EAirCabin | ETrainSeat | EShipCabin;     //仓位或者座位
    discount?: number;                  //大致折扣
    no?: string;
    bookurl?: string;
    deeplinkData?: object;
    agent?: string;
    carry?: string;
    originStation?: any;
    destinationStation?: any;
    segs?: any[];
}

export interface ITrafficBudgetResult extends Array<ITrafficBudgetItem> {
    [index: number]: ITrafficBudgetItem;
}

export interface IHotelBudgetItem extends IBudgetItem {
    city: string;
    checkInDate: Date;
    checkOutDate: Date;
    star: EHotelStar;                       //酒店星级
    name?: string;
    selectAddress?: {                       //用户选择的地标
        selectName: string;
        latitude: number;
        longitude: number;
    };
    latitude?: number;
    longitude?: number;
    bookurl?: string;
    deeplinkData?: object;
    commentScore?: number;
    landmark?: any;
    highestPrice?: number;
    duringDays: number;                           //天数
}

export interface ISubsidyItem extends IBudgetItem {
    city: string;
    fromDate: Date;
    endDate: Date;
    duringDays: number;
    templates: any;
}

export interface IHotelBudgetResult extends Array<IHotelBudgetItem> {
    [index: number]: IHotelBudgetItem;
}

export interface IPrefer {
    name: string;
    options: any;
}

@Table(Models.budget, "budget.")
export class Budget extends ModelObject {
    constructor(target: Object) {
        super(target)
    }

    @Create()
    static create(obj: any): Budget { return null }

    @Field({ type: Types.UUID })
    get id() { return uuid.v1() }
    set id(id: string) { }

    @Field({ type: Types.JSONB })
    get query(): GetBudgetParams { return null }
    set query(qs: GetBudgetParams) { }

    @Field({ type: Types.JSONB })
    get result(): BudgetFinallyResult { return null }
    set result(result: BudgetFinallyResult) { }

    @Field({ type: Types.JSONB })
    get resultFinally(): BudgetFinallyResult { return null }
    set resultFinally(result: BudgetFinallyResult) { }
}

@Table(Models.budgetItem, "budget.")
export class BudgetItem extends ModelObject {

    constructor(target: Object) {
        super(target);
    }

    @Create()
    static create(obj: any): BudgetItem { return null }

    @Field({ type: Types.UUID })
    get id() { return uuid.v1() }
    set id(id: string) { }

    @Field({ type: Types.TEXT })
    get title(): string { return null }
    set title(title: string) { }

    @Field({ type: Types.TEXT })
    get travelCity(): string { return null}
    set travelCity(title: string) { }

    @Field({ type: Types.STRING})
    get companyName(): string { return null}
    set companyName(companyName: string) { }

    @Field({type: Types.TEXT})
    get departureDate(): string { return null}
    set departureDate(date: string) {}

    @Field({ type: Types.JSONB })
    get query() { return null }
    set query(query) { }

    @Field({ type: Types.JSONB })
    get originData() { return null }
    set originData(originData) { }

    @Field({ type: Types.JSONB })
    get markedData() { return null }
    set markedData(markedData: Object) { }

    @Field({ type: Types.JSONB })
    get prefers() { return null }
    set prefers(prefers: Object) { }

    @Field({ type: Types.JSONB })
    get result() { return null }
    set result(result) { }

    @Field({ type: Types.INTEGER })
    get status(): Number { return 0 }
    set status(status: Number) { }

    @Field({ type: Types.INTEGER })
    get type(): Number { return 1 }
    set type(type: Number) { }
}

@Table(Models.deeplink, "deeplink.")
export class Deeplink extends ModelObject {

    constructor(target: Object) {
        super(target);
    }

    @Create()
    static create(obj: any): Deeplink { return null }

    @Field({ type: Types.UUID })
    get id() { return uuid.v1() }
    set id(id: string) { }

    @Field({ type: Types.INTEGER })
    get type(): Number { return 1 }
    set type(type: Number) { }

    @Field({ type: Types.TEXT })
    get url(): string { return null }
    set url(url: string) { }


}

export enum STEP {
    ONE = "FULL",
    TWO = "CACHE",
    FINAL = "FIN"
}

export interface FinalBudgetResultInterface {
    id?: string;
    orderId: string;
    step?: STEP;
    cities: string[];
    budgets: SegmentBudgetItem[]
}

export interface SegmentBudgetItem {
    traffic: ITrafficBudgetResult,
    hotel: IHotelBudgetResult,
    subsidy: ISubsidyItem
}