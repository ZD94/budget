/**
 * Created by wlh on 2017/8/29.
 */

'use strict';
import {AbstractController, Restful} from "@jingli/restful";
import {TravelPolicy} from "_types/policy";
import {Models} from "_types";
var travelPolicyRegionCols = TravelPolicy['$fieldnames'];

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
export class TravelPolicyController extends AbstractController {

    constructor() {
        super();
    }

    $isValidId(id: string) {
        return /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(id);
    }

    async get(req, res, next) {
        let params = req.params;
        let id = params.id;
        if(!id || typeof(id) == 'undefined') {
            return res.json(this.reply(0, null));
        }
        let result = await Models.travelPolicy.get(id);
        if(result == undefined) result = null;
        res.json(this.reply(0, result));
    }

    async find(req, res, next) {
        //请求参数中添加page, 表示请求页数
        let {p, pz, order} = req.query;
        let {companyId} = req.session;
        p = p || 1;
        pz = pz || 20;
        let params = req.query;
        let query = {
            where:{companyId: companyId},
            limit: pz,
            offset: pz * (p-1)
        };
        for(let key in params){
            if(travelPolicyRegionCols.indexOf(key) >= 0){
                query.where[key] = params[key];
            }
        }

        if(!order || typeof order == undefined)
            query["order"] = [["createdAt", "desc"]];
        let result = await Models.travelPolicy.find(query);
        result = transform(result);
        if(result == undefined) result = null;
        res.json(this.reply(0, result));
    }


    async update(req, res, next) {
        let params = req.body;
        let id = req.params.id;
        if(!id || typeof(id) == 'undefined') {
            return res.json(this.reply(0, null));
        }
        let obj = await Models.travelPolicy.get(id);

        for(let key in params){
            if(travelPolicyRegionCols.indexOf(key) >= 0){
                obj[key] = params[key];
            }
        }
        obj = await obj.save();
        res.json(this.reply(0, obj));
    }


    async add(req, res, next) {
        let params = req.body;
        let properties = {};
        for(let key in params){
            if(travelPolicyRegionCols.indexOf(key) >= 0){
                properties[key] = params[key];
            }
        }
        let obj = TravelPolicy.create(properties);
        obj = await obj.save();
        res.json(this.reply(0, obj));
    }

    async delete(req, res, next) {
        let params = req.params;
        let id = params.id;
        if(!id || typeof(id) == 'undefined') {
            return res.json(this.reply(0, null));
        }
        let isDeleted;
        let tprs = await Models.travelPolicyRegion.find({where: {travelPolicyId: id}});
        try{
            await Promise.all(tprs.map(async function(item){
                let tpr = await Models.travelPolicyRegion.get(item.id);
                await tpr.destroy();
            }));
            let obj = await Models.travelPolicy.get(id);
            isDeleted = await obj.destroy();
        }catch(err){
            console.log(err);
        }
        res.json(this.reply(0, isDeleted));
    }


}

//处理差旅政策
function transform(policies) {
    let result:any = [];
    policies.map(function(policy){
        let tp :any = {};
         travelPolicyRegionCols.forEach(function(key){
             tp[key] = policy[key];
         })
        result.push(tp)
    });
    return result;
}

