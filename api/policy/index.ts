/**
 * Created by wyl on 15-12-12.
 */
'use strict';
import {DB} from '@jingli/database';
var _ = require('lodash');
import {Paginate} from 'common/paginate';
import L from '@jingli/language';
import {requireParams, clientExport} from '@jingli/dnode-api/dist/src/helper';
// import {conditionDecorator, condition} from "../_decorator";
// import {Staff, EStaffStatus,EStaffRole} from "_types/staff";
import { TravelPolicy, SubsidyTemplate,TravelPolicyRegion,CompanyRegion,RegionPlace, EHotelLevel, EPlaneLevel, ETrainLevel } from '_types/policy';
import { Models } from '_types';
import { FindResult, PaginateInterface } from "common/model/interface";
import setPrototypeOf = Reflect.setPrototypeOf;

const travalPolicyCols = TravelPolicy['$fieldnames'];
const travalPolicyRegionCols = TravelPolicyRegion['$fieldnames'];
const subsidyTemplateCols = SubsidyTemplate['$fieldnames'];
const companyRegionCols = CompanyRegion['$fieldnames'];
const regionPlaceCols = RegionPlace['$fieldnames'];


export class ITravelPolicy {
    id:string;
    name: string;
    isChangeLevel: string;
    companyId: string;
    isDefault: string;
    isOpenAbroad: string;
    constructor(params){
        this.id = params.id;
        this.name = params.name;
        this.companyId = params.companyId;
        this.isChangeLevel = params.isChangeLevel;
        this.isDefault = params.isDefault;
        this.isOpenAbroad = params.isOpenAbroad;
    }
}

export class ITravelPolicyRegion {
    id:string;
    travelPolicyId: string;
    companyRegionId: string;
    planeLevels: Array<number>;
    trainLevels: Array<number>;
    hotelLevels: Array<number>;
    trafficPrefer: number;
    hotelPrefer: number;
    minPriceLimit: number;
    maxPriceLimit: number;

    constructor(params){
        this.id = params.id;
        this.travelPolicyId = params.travelPolicyId;
        this.companyRegionId = params.companyRegionId;
        this.planeLevels = params.planeLevels;
        this.trainLevels = params.trainLevels;
        this.hotelLevels = params.hotelLevels;
        this.trafficPrefer = params.trafficPrefer;
        this.hotelPrefer = params.hotelPrefer;
        this.minPriceLimit = params.minPriceLimit;
        this.maxPriceLimit = params.maxPriceLimit;
    }
}

export class IRegionPlace {
    id:string;
    placeId: string;
    companyRegionId: string;
    constructor(params){
        this.id = params.id;
        this.placeId = params.placeId;
        this.companyRegionId = params.companyRegionId;
    }
}

export class ICompanyRegion {
    id:string;
    name: string;
    companyId: string;
    constructor(params){
        this.id = params.id;
        this.name = params.name;
        this.companyId = params.companyId;
    }
}

export class ISubsidyTemplate {
    id:string;
    subsidyMoney: string;
    name: string;
    travelPolicyId: string;
    isInternal: string;
    constructor(params){
        this.id = params.id;
        this.name = params.name;
        this.subsidyMoney = params.subsidyMoney;
        this.travelPolicyId = params.travelPolicyId;
        this.isInternal = params.isInternal;
    }
}

let API = require("@jingli/dnode-api");
import route = require("../../app");
import {DefaultRegion, DefaultRegionId,TravelPolicyType} from "_types/policy";
export default class TravelPolicyModule{

    async getBestTravelPolicy(params:{travelPolicyId: string, placeId: string, type: string}): Promise<any>{
        let {placeId,type, travelPolicyId} = params;
        let self = this;
        let placeid = placeId;
        let tprs = await Models.travelPolicyRegion.all({
            where: {travelPolicyId: travelPolicyId}
        });
        let crIds: string[] = [];
        for(let i =0; i <tprs.length; i++){
            crIds.push(tprs[i]["companyRegionId"]);
        }
        do {
            let cps = await Models.regionPlace.find({
                where: {companyRegionId: {$in: crIds}, placeId: placeid}});
            if(cps && cps.length ){
                let expectedTpr = await Models.travelPolicyRegion.find({where: {travelPolicyId: travelPolicyId,companyRegionId: cps[0]["companyRegionId"]}});
                if(expectedTpr && expectedTpr.length && expectedTpr[0][type]){
                    return expectedTpr[0][type];
                }

            }
            let cityInfo = await API.place.getCityInfo({cityCode: placeid});
            if (!cityInfo) {
                return getDefault(type);
            }
            if(cityInfo.parentId) {
                placeid = cityInfo.parentId;
                continue;
            }

            if(!cityInfo.isAbroad)
                placeid = DefaultRegionId.domestic;   //
            if(cityInfo.isAbroad)
                placeid = DefaultRegionId.abroad;     //
            if(cityInfo.id == DefaultRegionId.domestic || cityInfo.id == DefaultRegionId.abroad) {
                return getDefault(type);
            }
        } while(placeid);

        function getDefault(type) {
            if(type == TravelPolicyType.maxPriceLimit) return 0;
            if(type == TravelPolicyType.minPriceLimit) return 0;
            if(type == TravelPolicyType.hotelPrefer) return -1;
            if(type == TravelPolicyType.trafficPrefer) return -1;
            return null;
        }
    }

    /*************************************差旅标准begin***************************************/
    async getDefaultTravelPolicy(params: {companyId: string}): Promise<ITravelPolicy> {
        let {companyId } = params;
        let self = this;
        var tps = await Models.travelPolicy.find({where: {companyId: companyId, isDefault: true}});
        if(!tps || tps.length == 0){
            tps = await Models.travelPolicy.find({where: {companyId: companyId}});
            if (!tps || tps.length == 0) {
                let travelPolicy = TravelPolicy.create({
                    name: '默认标准',
                    planeLevels: [EPlaneLevel.ECONOMY],
                    trainLevels: [ETrainLevel.SECOND_SEAT],
                    hotelLevels: [EHotelLevel.THREE_STAR], subsidy: 0,
                    isDefault: true,
                    companyId: companyId
                });
                travelPolicy = await travelPolicy.save();
                let tp = new ITravelPolicy(travelPolicy)
                return tp;
            }
        }
        let tp = new ITravelPolicy(tps[0])
        return tp;
    }

    // 必须获取的参数： name, companyId, isOpenAbroad, isDefault
    static async createTravelPolicy (params) : Promise<ITravelPolicy>{

        let result = await Models.travelPolicy.find({where: {name: params.name, companyId: params.companyId}});
        if(result && result.length>0){
            throw L.ERR.TRAVEL_POLICY_NAME_REPEAT();
        }

        let travelPolicyParams:{name: string,companyId: string, isOpenAbroad?:boolean, isDefault?: boolean} = {
            name: params.name,
            companyId: params.companyId,
        };
        if(params.isOpenAbroad){
            travelPolicyParams.isOpenAbroad = params.isOpenAbroad;
        }
        if(params.isDefault){
            travelPolicyParams.isDefault = params.isDefault;
        }
        let travelp = TravelPolicy.create(travelPolicyParams);

        if(travelp.isDefault){
            let defaults = await Models.travelPolicy.find({where: {id: {$ne: travelp.id}, is_default: true, companyId: params.companyId}});
            if(defaults && defaults.length>0){
                await Promise.all(defaults.map(async function(item){
                    item.isDefault = false;
                    await item.save();
                }))
            }
        }
        // travelp.company = await Models.company.get(params.companyId)
        travelp = await travelp.save();
        let tp = new ITravelPolicy(travelp);
        return tp;

    }
    //需要传入 travelPolicyId, companyId
    static async updateTravelPolicy(params) : Promise<ITravelPolicy>{
        var id = params.id;
        let companyId = params.companyId;
        var tp = await Models.travelPolicy.get(id);
        if(params.name){
            let result = await Models.travelPolicy.find({where: {name: params.name, companyId: companyId}});
            if(result && result.length>0){
                throw L.ERR.TRAVEL_POLICY_NAME_REPEAT();
            }
        }

        if(params.isDefault){
            let defaults = await Models.travelPolicy.find({where: {id: {$ne: tp.id}, is_default: true, companyId: companyId}});
            if(defaults && defaults.length>0){
                await Promise.all(defaults.map(async function(item){
                    item.isDefault = false;
                    await item.save();
                }))
            }
        }

        for(var key in params){
            tp[key] = params[key];
        }
        tp = await tp.save();
        return new ITravelPolicy(tp);

    }
    // @clientExport
    // static async getDefaultTravelPolicy(): Promise<TravelPolicy>{
    //     let dep = await Models.travelPolicy.get('dc6f4e50-a9f2-11e5-a9a3-9ff0188d1c1a');
    //     return dep;
    // }
    //必须传递travelPolicyId
    static async deleteTravelPolicy(params:{id:string}) : Promise<boolean>{
        // var staff = await Staff.getCurrent();
        var id = params.id;
        var tp_delete = await Models.travelPolicy.get(id);
        // if(tp_delete.isDefault){
        //     throw {code: -2, msg: '不允许删除默认差旅标准'};
        // }
        // let staffs = await Models.staff.find({where: {travelPolicyId: id, staffStatus: EStaffStatus.ON_JOB}});
        // if(staffs && staffs.length > 0){
        //     throw {code: -1, msg: '目前有'+staffs.length+'位员工在使用此标准请先移除'};
        // }
        // if(staff && tp_delete["companyId"] != staff["companyId"]){
        //     throw L.ERR.PERMISSION_DENY();
        // }

        var travelPolicyRegions = await tp_delete.getTravelPolicyRegions();
        if(travelPolicyRegions && travelPolicyRegions.length > 0){
            await Promise.all(travelPolicyRegions.map(async function(item){
                await item.destroy();
                return true;
            }))
        }

        var templates = await tp_delete.getSubsidyTemplates();
        if(templates && templates.length>0){
            await Promise.all(templates.map(async function(item){
                await item.destroy();
                return true;
            }))
        }

        await tp_delete.destroy();
        return true;

    }

    static async deleteTravelPolicyByTest(params){
        await DB.models.TravelPolicy.destroy({where: {$or: [{name: params.name}, {companyId: params.companyId}]}});
        return true;
    }

    static async getTravelPolicy(params: {id:string}) : Promise<ITravelPolicy>{
        let {id} = params;
        //var staff = await Staff.getCurrent();
        var tp = await Models.travelPolicy.get(id);

        let travelp = new ITravelPolicy(tp);
        return travelp;
    };
    // 必须传入 travelPolicyRegionId, companyId
    static async getTravelPolicies(params): Promise<FindResult>{
        // var staff = await Staff.getCurrent();
        // console.log("====>parmas; ", params);
        let order = params.order || [['createdAt', 'desc']];
        let query = {where: params, order: order};
        if(params.order) {
            delete params.order;
        }
        let result = await Models.travelPolicy.find(query);
        let ids = result.map((tp)=>{
            return tp.id
        });
        // console.log(===>);
        return {ids: ids, count: result["total"]};
    }

    static async listAndPaginateTravelPolicy(params){
        var options: any = {};
        if(params.options){
            options = params.options;
            delete params.options;
        }
        var page, perPage, limit, offset;
        if (options.page && /^\d+$/.test(options.page)) {
            page = options.page;
        } else {
            page = 1;
        }
        if (options.perPage && /^\d+$/.test(options.perPage)) {
            perPage = options.perPage;
        } else {
            perPage = 6;
        }
        limit = perPage;
        offset = (page - 1) * perPage;
        if (!options.order) {
            options.order = [["created_at", "desc"]]
        }
        options.limit = limit;
        options.offset = offset;
        options.where = params;

        return DB.models.TravelPolicy.findAndCountAll(options)
            .then(function(result){
                return new Paginate(page, perPage, result.count, result.rows);
            });

    }
    /*************************************差旅标准end***************************************/


    static async createTravelPolicyRegion(params):Promise<ITravelPolicyRegion>{
        let {travelPolicyId, planeLevels, trainLevels, hotelLevels,regionId,companyRegionId } = params;

        let detailPolicy = {
            regionId: regionId,
            travelPolicyId: travelPolicyId,
            planeLevels: tryConvertToArray(planeLevels),
            trainLevels: tryConvertToArray(trainLevels),
            hotelLevels: tryConvertToArray(hotelLevels),
            companyRegionId: companyRegionId
        }
        let travelPolicyRegion = TravelPolicyRegion.create(detailPolicy);
        // travelPolicyRegion.travelPolicy = await Models.travelPolicy.get(travelPolicyId);
        travelPolicyRegion = await travelPolicyRegion.save();
        let tpr = new ITravelPolicyRegion(travelPolicyRegion);
        return tpr;
    }

    static async updateTravelPolicyRegion(params) : Promise<ITravelPolicyRegion>{
        var id = params.id;
        var tpr = await Models.travelPolicyRegion.get(id);

        params.planeLevels = tryConvertToArray(params.planeLevels);
        params.trainLevels = tryConvertToArray(params.trainLevels);
        params.hotelLevels = tryConvertToArray(params.hotelLevels);

        for(var key in params){
            tpr[key] = params[key];
        }
        tpr.planeLevels = params.planeLevels;
        tpr.trainLevels = params.trainLevels;
        tpr.hotelLevels = params.hotelLevels;

        tpr = await tpr.save();
        return new ITravelPolicyRegion(tpr)
    }

    // 必须传入 travelPolicyRegionId
    static async deleteTravelPolicyRegion(params) : Promise<any>{
        // var staff = await Staff.getCurrent();
        var id = params.id;
        var tpr_delete = await Models.travelPolicyRegion.get(id);

        await tpr_delete.destroy();
        return true;
    }

    static async getTravelPolicyRegion(params:{id:string,travelPolicyId?:string}): Promise<ITravelPolicyRegion> {
        let id = params.id
        let tpr = await Models.travelPolicyRegion.get(id);
        return new ITravelPolicyRegion(tpr);
    }

    static async getTravelPolicyRegions(params): Promise<FindResult>{
        params.order = params.order || [['created_at', 'desc']];
        let paginate = await Models.travelPolicyRegion.find(params);

        let ids =  paginate.map(function(t){
            return t.id;
        })
        return {ids: ids, count: paginate['total']};
    }


    async getAvaliableRegionIds(params: {where: any}) : Promise<TravelPolicyRegion[]>{
        return Models.travelPolicyRegion.find(params);
    }

    // static async getAllTravelPolicy(params): Promise<PaginateInterface<TravelPolicy> >{
    //
    //     // var staff = await Staff.getCurrent();
    //     //let companyId = params.companyId;
    //
    //     let options: any = {
    //         where: _.pick(params, ['name', 'planeLevel', 'planeDiscount', 'trainLevel', 'hotelLevel', 'hotelPrice', 'companyId', 'isChangeLevel', 'createdAt'])
    //     };
    //     if(params.columns){
    //         options.attributes = params.columns;
    //     }
    //     if(params.order){
    //         options.order = params.order || "createdAt desc";
    //     }
    //
    //     // if(staff){
    //     //     options.where.companyId = staff["companyId"];
    //     // }
    //
    //     return  Models.travelPolicy.find(options);
    //
    // }




    /*************************************补助模板begin***************************************/
    static async createSubsidyTemplate (params) : Promise<ISubsidyTemplate>{

        /*let result = await Models.subsidyTemplate.find({where: {travelPolicyId: params.travelPolicyId}});
        if(result && result.length>0){
            throw {msg: "该城市补助模板已设置"};
        }*/
        var subsidyTemplate = SubsidyTemplate.create(params);
        subsidyTemplate = await subsidyTemplate.save();
        return new ISubsidyTemplate(subsidyTemplate);
    }


    static async deleteSubsidyTemplate(params) : Promise<boolean>{
        var id = params.id;
        var st_delete = await Models.subsidyTemplate.get(id);

        await st_delete.destroy();
        return true;
    }


    static async updateSubsidyTemplate(params) : Promise<ISubsidyTemplate>{
        var id = params.id;
        //var staff = await Staff.getCurrent();

        var ah = await Models.subsidyTemplate.get(id);
        for(var key in params){
            ah[key] = params[key];
        }
        ah = await ah.save();
        return new ISubsidyTemplate(ah)
    }


    static async getSubsidyTemplate(params: {id: string, travelPolicyId?: string}) : Promise<SubsidyTemplate>{
        let id = params.id;
        var ah = await Models.subsidyTemplate.get(id);

        return new SubsidyTemplate(ah);
    };


    static async getSubsidyTemplates(params): Promise<FindResult>{
        params.order = params.order || [['subsidyMoney', 'desc']];

        let paginate = await Models.subsidyTemplate.find(params);
        let ids =  paginate.map(function(t){
            return t.id;
        })
        return {ids: ids, count: paginate['total']};
    }
    /*************************************补助模板end***************************************/


    /*************************************差旅标准的地区关系(CompanyRegion)begin***************************************/

    static async getCompanyRegion(params: {id: string}) : Promise<ICompanyRegion>{

        let id = params.id;
        return Models.companyRegion.get(id);
    };


    static async getCompanyRegions(params) : Promise<FindResult>{
        let paginate = await Models.companyRegion.find(params);
        console.log("====> paginate: ", paginate);
        let ids =  paginate.map(function(t){
            return t.id;
        })
        return {ids: ids, count: paginate['total']};
    };


    static async createCompanyRegion(params) : Promise<ICompanyRegion>{
        let cRegionParam: {id: string, companyId: string, name: string} = {
            id: params.id,
            companyId: params.companyId,
            name: params.name
        }
        let cRegion = CompanyRegion.create(cRegionParam);
        // cRegion.company = await Models.company.get(params.companyId);
        return cRegion.save();
    };

    /*************************************差旅标准的地区关系(CompanyRegion)end***************************************/


    /*************************************地区管理(RegionPlace)begin***************************************/


    @clientExport
    @requireParams(["id"])
    static async getRegionPlace(params: {id: string}) : Promise<IRegionPlace>{
        let id = params.id;
        var cregion = await Models.regionPlace.get(id);
        // console.log("cregion: ", cregion);
        return new IRegionPlace(cregion)
    };

    @clientExport
    @requireParams(["where.id","where.companyId","where.name"])
    static async getRegionPlaces(params) : Promise<FindResult>{
        let paginate = await Models.regionPlace.find(params);
        let ids =  paginate.map(function(t){
            return t.id;
        })
        return {ids: ids, count: paginate['total']};
    };

    @clientExport
    @requireParams(["companyRegionId","placeId"], regionPlaceCols)
    static async createRegionPlace(params) : Promise<IRegionPlace>{
        let rPlaceParam: {id: string, companyRegionId: string, placeId: string} = {
            id: params.id,
            companyRegionId: params.companyRegionId,
            placeId: params.placeId
        }
        let cRegion = RegionPlace.create(rPlaceParam);
        // cRegion.companyRegion = await Models.companyRegion.get(params.companyRegionId);
        cRegion = await cRegion.save();
        return new IRegionPlace(cRegion);
    };


    /*************************************地区设置(RegionPlace)end***************************************/

}

// app.post("/policy/", async function(req, res, next){
//     // let {method, params} = req;
//     console.log("=====> param: ", req.body);
//     let body = req.body;
//     let {fields, method} = req.body;
//     let result =await TravelPolicyModule[method](fields);
//
//     console.log(result);
//     res.json(result);
//     // res.json("hello world: ");
// });
// app.get("/policy/info", async function(req, res, next){
//     // let {method, params} = req;
//     console.log("=====> param: ", req);
//     // let result = TravelPolicyModule[method](params);
//     // res.json(result);
//     res.json("hello world: ");
// });


function tryConvertToArray(val) {
    if (val && !_.isArray(val)) {
        return [val];
    }
    return val;
}









