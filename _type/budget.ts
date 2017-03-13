/**
 * Created by wlh on 2017/3/13.
 */

'use strict';

import {ICity} from '_type/city';
import {ModelObject} from "common/model/object";
import {Table, Field, Create} from "common/model/common";
import {Models} from "_type/index";
import uuid = require("uuid");
import {Types} from "../common/model/index";
export enum EShipCabin {
}

export enum EAirCabin {
    ECONOMY = 1
}

export enum ETrainSeat {
}

export enum EHotelStar {
    FIVE = 5,
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

export interface IQueryHotelBudgetParams {
    city: ICity;
    checkInDate: Date;
    checkOutDate: Date;
    policies: IPolicySet;
    staffs: IStaff[];
    prefers: IPrefer[];
}

export interface IQueryTrafficBudgetParams {
    fromCity: ICity;
    toCity: ICity;
    beginTime: Date;
    endTime: Date;
    prefers: IPrefer[];
    policies: IPolicySet;
    staffs: IStaff[];
}

export interface IQueryBudgetParams extends IAuthParams {
    fromCity?: ICity;       //出发城市
    segs: ISeg[];      //每段查询条件
    ret: boolean;       //是否往返
    staffs: IStaff[];  //出差员工
    policies: IPolicySet;     //可能用到的全部差旅标准
    combineRoom: boolean;   //同性是否合并
    prefers?: IPrefer[];
}

export interface ISeg {
    city: ICity;    //目的地
    beginTime: Date;   //事务开始时间
    endTime: Date; //事务结束时间
    location?: ILocation; //经纬度，如果不存在使用城市经纬度
}

export interface ILocation {
    longitude: number; //国际标准
    latitude: number;  //国际标准
    // name?: string;  //住宿点
}

export interface IStaff {
    gender: EGender,          //性别
    policy: string;
}

export interface IPolicySet {
    [key:string]:IPolicy
}

export interface IPolicy {
    cabin?: Array<EAirCabin>;           //飞机
    trainSeat?: Array<ETrainSeat>;      //火车
    hotelStar?: Array<EHotelStar>;      //酒店
    shipCabin?: Array<EShipCabin>;      //轮船
}


export interface IBudgetResult {
    id:string;
    budgets: Array<IBudgetItem>;
}

export interface IBudgetItem {
    price: number;
    type: EBudgetType;
    link?: string;
}

export enum EBudgetType {
    TRAFFIC = 1,
    HOTEL = 2,
}

export enum ETrafficType {
    TRAIN = 1,
    PLANE = 2,
    SHIP = 3,
    CAR = 4,
    BUS = 5,
    SELF_DRIVER = 6,
    CAR_RENT = 7,
}

export interface ITrafficBudgetItem extends IBudgetItem {
    fromCity: ICity;                           //出发城市
    toCity: ICity;                        //目的城市
    departTime: Date;
    arrivalTime: Date;
    trafficType: ETrafficType;                  //交通类别,飞机、火车、轮船、大巴、打车或者自驾,租车
    cabin?: EAirCabin | ETrainSeat | EShipCabin;     //仓位或者座位
    discount?: number;                  //大致折扣
    no?: string;
    supplier?: string;
}

export interface IHotelBudgetItem extends IBudgetItem {
    checkInDate: Date;                    //入住日期
    checkOutDate: Date;                   //离店日期
    star: EHotelStar;                       //酒店星级
    name?: string;
    supplier?: string;
}

export interface IPrefer {
    name: string;
    options: any;
}

@Table(Models.budget, "openapi.budget")
export class Budget extends ModelObject {
    constructor(target:Object) {
        super(target)
    }

    @Create()
    static create(obj: any) : Budget {return null}

    @Field({type: Types.UUID})
    get id() { return uuid.v1()}
    set id(id: string) {}

    @Field({type: Types.UUID})
    get appid() { return null}
    set appid(appid: string) {}

    @Field({type: Types.JSONB})
    get query() : IQueryBudgetParams{ return null}
    set query(qs: IQueryBudgetParams) {}

    @Field({type: Types.JSONB})
    get result() :IBudgetResult { return null}
    set result(result: IBudgetResult) {}
}