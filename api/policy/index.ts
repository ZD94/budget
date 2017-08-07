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
import { TravelPolicy, SubsidyTemplate,TravelPolicyRegion,CompanyRegion,RegionPlace } from '_types/policy';
import { Models } from '_types';
import { FindResult, PaginateInterface } from "common/model/interface";
import setPrototypeOf = Reflect.setPrototypeOf;

const travalPolicyCols = TravelPolicy['$fieldnames'];
const travalPolicyRegionCols = TravelPolicyRegion['$fieldnames'];
const subsidyTemplateCols = SubsidyTemplate['$fieldnames'];
const companyRegionCols = CompanyRegion['$fieldnames'];
const regionPlaceCols = RegionPlace['$fieldnames'];

let API = require("@jingli/dnode-api");
import {DefaultRegion} from "_types/policy"
class TravelPolicyModule{

    // 必须获取的参数： name, companyId, isOpenAbroad, isDefault
    static async createTravelPolicy (params) : Promise<TravelPolicy>{

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
        return travelp.save();

    }


    static async createTravelPolicyRegion(params):Promise<TravelPolicyRegion>{
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
        return travelPolicyRegion.save();
    }


    //必须传递travelPolicyId
    static async deleteTravelPolicy(params:{id:string}) : Promise<any>{
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

    //需要传入 travelPolicyId, companyId
    static async updateTravelPolicy(params) : Promise<TravelPolicy>{
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
        return tp.save();

    }


    static async updateTravelPolicyRegion(params) : Promise<TravelPolicyRegion>{
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

        return tpr.save();
    }

    // 必须传入 travelPolicyRegionId
    static async deleteTravelPolicyRegion(params) : Promise<any>{
        // var staff = await Staff.getCurrent();
        var id = params.id;
        var tpr_delete = await Models.travelPolicyRegion.get(id);

        await tpr_delete.destroy();
        return true;
    }

    @clientExport
    static async getDefaultTravelPolicy(): Promise<TravelPolicy>{
        let dep = await Models.travelPolicy.get('dc6f4e50-a9f2-11e5-a9a3-9ff0188d1c1a');
        return dep;
    }


    static async getTravelPolicy(params: {id: string, companyId?: string}) : Promise<TravelPolicy>{
        let id = params.id;
        //var staff = await Staff.getCurrent();
        var tp = await Models.travelPolicy.get(id);

        return tp;
    };

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

    // 必须传入 travelPolicyRegionId, companyId
    static async getTravelPolicies(params): Promise<FindResult>{
        // var staff = await Staff.getCurrent();

        params.order = params.order || [['createdAt', 'desc']];

        // if(staff){
        //     params.where.companyId = staff["companyId"];//只允许查询该企业下的差旅标准
        // }

        let paginate = await Models.travelPolicy.find(params);
        let ids =  paginate.map(function(t){
            return t.id;
        })
        return {ids: ids, count: paginate['total']};
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

    static async createSubsidyTemplate (params) : Promise<SubsidyTemplate>{

        /*let result = await Models.subsidyTemplate.find({where: {travelPolicyId: params.travelPolicyId}});
        if(result && result.length>0){
            throw {msg: "该城市补助模板已设置"};
        }*/
        var subsidyTemplate = SubsidyTemplate.create(params);
        return subsidyTemplate.save();
    }


    static async deleteSubsidyTemplate(params) : Promise<any>{
        var id = params.id;
        var st_delete = await Models.subsidyTemplate.get(id);

        await st_delete.destroy();
        return true;
    }


    static async updateSubsidyTemplate(params) : Promise<SubsidyTemplate>{
        var id = params.id;
        //var staff = await Staff.getCurrent();

        var ah = await Models.subsidyTemplate.get(id);
        for(var key in params){
            ah[key] = params[key];
        }
        return ah.save();
    }


    static async getSubsidyTemplate(params: {id: string, travelPolicyId?: string}) : Promise<SubsidyTemplate>{
        let id = params.id;
        var ah = await Models.subsidyTemplate.get(id);

        return ah;
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


    static async getTravelPolicyRegion(params:{id:string,travelPolicyId?:string}): Promise<TravelPolicyRegion> {
        let id = params.id
        let tpr = await Models.travelPolicyRegion.get(id);
        return tpr;
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

    /*************************************差旅标准的地区关系(CompanyRegion)begin***************************************/

    static async getCompanyRegion(params: {id: string}) : Promise<CompanyRegion>{

        let id = params.id;
        return Models.companyRegion.get(id);
    };


    static async getCompanyRegions(params) : Promise<FindResult>{
        let paginate = await Models.companyRegion.find(params);
        let ids =  paginate.map(function(t){
            return t.id;
        })
        return {ids: ids, count: paginate['total']};
    };


    static async createCompanyRegion(params) : Promise<CompanyRegion>{
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
    static async getRegionPlace(params: {id: string}) : Promise<RegionPlace>{
        let id = params.id;
        var cregion = await Models.regionPlace.get(id);
        console.log("cregion: ", cregion);
        return cregion;
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
    static async createRegionPlace(params) : Promise<RegionPlace>{
        let rPlaceParam: {id: string, companyRegionId: string, placeId: string} = {
            id: params.id,
            companyRegionId: params.companyRegionId,
            placeId: params.placeId
        }
        let cRegion = RegionPlace.create(rPlaceParam);
        // cRegion.companyRegion = await Models.companyRegion.get(params.companyRegionId);
        return cRegion.save();
    };


    /*************************************地区设置(RegionPlace)end***************************************/

}

function tryConvertToArray(val) {
    if (val && !_.isArray(val)) {
        return [val];
    }
    return val;
}

export = TravelPolicyModule;