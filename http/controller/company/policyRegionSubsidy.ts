/**
 * Created by wyl on 2017/8/29.
 */


'use strict';
import {AbstractController, AbstractModelController, Restful, Router} from "@jingli/restful";
import API from '@jingli/dnode-api';
import {PolicyRegionSubsidy} from "_types/policy";
import {Models} from "_types";
var policyRegionSubsidyCols = PolicyRegionSubsidy['$fieldnames'];

@Restful()
export class PolicyRegionSubsidyController extends AbstractModelController<PolicyRegionSubsidy> {

    constructor() {
        super(Models.policyRegionSubsidy, policyRegionSubsidyCols);
    }

    @Router('/getByCity', "GET")
    async getByCity(req, res, next){
        let {travelPolicyId, cityId} = req.query;
        console.info(travelPolicyId, cityId);
        let tp = await Models.travelPolicy.get(travelPolicyId);
        let subsidies = [];
        if(tp){
            subsidies = await tp.getSubsidies({placeId: cityId});
        }
        res.json(this.reply(0, subsidies));
    }

    /*async get(req, res, next) {
        let params = req.params;
        let id = params.id;
        if(!id || typeof(id) == 'undefined') {
            res.json(0, null);
        }
        let result = await Models.policyRegionSubsidy.get(id);
        if(result == undefined) result = null;
        res.json(this.reply(0, result));
    }

    async find(req, res, next) {
        //请求参数中添加page, 表示请求页数
        let params = req.query;
        let query = {where:{}};
        let limit = 20;
        for(let key in params){
            if(policyRegionSubsidyCols.indexOf(key) >= 0){
                query.where[key] = params[key];
            }
        }
        if(!query['order'] || query['order'] == undefined)
            query["order"] = [["createdAt", "desc"]];
        if(!query['limit'] || query['limit'] == undefined)
            query["limit"] = limit;

        let result = await Models.policyRegionSubsidy.all(query);
        if(result == undefined) result = null;
        res.json(this.reply(0, result));
    }


    async update(req, res, next) {
        let params = req.body;
        let id = params.id;
        if(!id || typeof(id) == 'undefined') {
            res.json(0, null);
        }
        let obj = await Models.policyRegionSubsidy.get(id);

        for(let key in params){
            if(policyRegionSubsidyCols.indexOf(key) >= 0){
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
            if(policyRegionSubsidyCols.indexOf(key) >= 0){
                properties[key] = params[key];
            }
        }
        let obj = PolicyRegionSubsidy.create(properties);
        obj = await obj.save();
        res.json(this.reply(0, obj));
    }

    async delete(req, res, next) {
        let params = req.params;
        let id = params.id;
        if(!id || typeof(id) == 'undefined') {
            res.json(0, null);
        }
        let obj = await Models.policyRegionSubsidy.get(id);
        let isDeleted = await obj.destroy();
        res.reply(0, isDeleted);
    }*/


}

