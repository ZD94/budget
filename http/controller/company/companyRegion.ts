/**
 * Created by wlh on 2017/8/29.
 */


'use strict';
import {AbstractController, Restful, Router} from "@jingli/restful";
import {CompanyRegion} from "_types/policy";
import {Models} from "_types";
import { autoSignReply } from 'http/reply';
var companyRegionCols = CompanyRegion['$fieldnames'];
import {transform} from "./travelPolicy";

const HOTEL_START = {
    FIVE: 5,
    FOUR: 4,
    THREE: 3,
    SECOND: 2
}
const TRAIN_SEAT = {
    BUSINESS_SEAT: 1,
    FIRST_SEAT: 2,
    SECOND_SEAT: 3,
    PRINCIPAL_SEAT: 4,
    SENIOR_SOFT_SLEEPER: 5,
    SOFT_SLEEPER: 6,
    HARD_SLEEPER: 7,
    SOFT_SEAT: 8,
    HARD_SEAT: 9,
    NO_SEAT: 10,
}

const CABIN = {
    ECONOMY: 2,
    FIRST: 3,
    BUSINESS: 4,
    PREMIUM_ECONOMY: 5,    //高端经济仓
}

const TRAFFIC_TYPE = {
    AIRPLANE: 1,
    TRAIN: 2
}

function enumToStr(obj: any, val: number) {
    let result;
    for(let key in obj) {
        if (obj[key] == val) {
            result = key;
            break;
        }
    }
    return result;
}

const GENDER = {
    FEMALE: 2,
    MALE: 1
}

//处理staffs
function transformStaffStrArgsToEnum(staffs) {
    //处理员工性别
    staffs = staffs.map( (staff) => {
        staff.gender = GENDER[staff.gender];
        return staff;
    });
    return staffs;
}


@Restful()
export class CompanyRegionController extends AbstractController {

    constructor() {
        super();
    }

    $isValidId(id: string) {
        return /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(id);
    }


    async get(req, res, next) {
        let {id} = req.params;
        let result = await Models.companyRegion.get(id);
        res.jlReply(this.reply(0, result || null));
    }


    async find(req, res, next) {
        //请求参数中添加page, 表示请求页数
        let params = req.query;
        let {companyId} = req.session;
        // let {order = [["createdAt", "desc"]], p = 0, pz = 20} = req.query;
        let type = 0;
        let query = {where: {companyId}};
        let limit = 20;
        for(let key in params){
            if(companyRegionCols.indexOf(key) >= 0){
                query.where[key] = params[key];
            }
        }
        if(!query['order'] || query['order'] == undefined)
            query["order"] = [["createdAt", "desc"]];
        if(!query['limit'] || query['limit'] == undefined)
            query["limit"] = limit;

        if(query.where && query.where["types"]){
            type = query.where["types"];
            delete query.where["types"];
        }
        let result = await Models.companyRegion.all(query);

        if(result == undefined) result = null;
        if(type && result){
            result = result.filter((item) => {
                let types = item.types;
                if(typeof types == 'string') types = JSON.parse(types);
                return types && types.indexOf(type) >= 0;
            })
        }
        result = transform(result, companyRegionCols);
        res.jlReply(this.reply(0, result));
    }


    async update(req, res, next) {
        let params = req.body;
        let obj = await Models.companyRegion.get(req.params.id);

        for(let key in params){
            if(companyRegionCols.indexOf(key) >= 0){
                obj[key] = params[key];
            }
        }
        obj = await obj.save();
        res.jlReply(this.reply(0, obj));
    }


    async add(req, res, next) {
        let params = req.body;
        let {companyId} = req.session;
        let properties = {companyId};
        for(let key in params){
            if(companyRegionCols.indexOf(key) >= 0){
                properties[key] = params[key];
            }
        }
        let obj = CompanyRegion.create(properties);
        obj = await obj.save();
        res.jlReply(this.reply(0, obj));
    }

    async delete(req, res, next) {
        let {id} = req.params;
        let obj = await Models.companyRegion.get(id);
        let isDeleted = await obj.destroy();
        res.jlReply(this.reply(0, isDeleted));
    }


}

//处理差旅政策
function transformPolicyStrArgsToEnum(policies) {
    for(let key in policies) {
        let policy = policies[key];
        if (!policy.trainSeat) {
            policy.trainSeat = [];
        }
        if (typeof policy.trainSeat == 'string') {
            policy.trainSeat = [policy.trainSeat]
        }
        policy.trainSeat = policy.trainSeat.map( (trainSeat) => {
            return TRAIN_SEAT[trainSeat];
        });

        if (!policy.cabin) {
            policy.cabin = []
        }
        if (typeof policy.cabin == 'string') {
            policy.cabin = [policy.cabin];
        }
        policy.cabin = policy.cabin.map( (cabin) => {
            return CABIN[cabin];
        });

        if (!policy.hotelStar) {
            policy.hotelStar = [];
        }
        if (typeof policy.hotelStar == 'string') {
            policy.hotelStar = [policy.hotelStar];
        }
        policy.hotelStar = policy.hotelStar.map( (hotelStar) => {
            return HOTEL_START[hotelStar];
        })
        policies[key] = policy;
    }
    return policies;
}

