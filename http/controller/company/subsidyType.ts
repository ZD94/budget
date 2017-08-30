/**
 * Created by wyl on 2017/8/29.
 */

'use strict';
import {AbstractController} from "http/core/AbstractController";
import {AbstractModelController} from "http/core/AbstractModelController";
import {Restful} from "http/core/decorator";
import API from '@jingli/dnode-api';
import {SubsidyType} from "_types/policy";
import {Models} from "_types";
var subsidyTypeCols = SubsidyType['$fieldnames'];

@Restful()
export class SubsidyTypeController extends AbstractModelController {

    constructor() {
        super(Models.subsidyType, subsidyTypeCols);
    }

    /*async get(req, res, next) {
        let params = req.params;
        let id = params.id;
        if(!id || typeof(id) == 'undefined') {
            res.json(0, null);
        }
        let result = await Models.subsidyType.get(id);
        if(result == undefined) result = null;
        res.json(this.reply(0, result));
    }

    async find(req, res, next) {
        //请求参数中添加page, 表示请求页数
        let params = req.query;
        let query = {where:{}};
        let limit = 20;
        for(let key in params){
            if(subsidyTypeCols.indexOf(key) >= 0){
                query.where[key] = params[key];
            }
        }
        if(!query['order'] || query['order'] == undefined)
            query["order"] = [["createdAt", "desc"]];
        if(!query['limit'] || query['limit'] == undefined)
            query["limit"] = limit;

        let result = await Models.subsidyType.all(query);
        if(result == undefined) result = null;
        res.json(this.reply(0, result));
    }


    async update(req, res, next) {
        let params = req.body;
        let id = params.id;
        if(!id || typeof(id) == 'undefined') {
            res.json(0, null);
        }
        let obj = await Models.subsidyType.get(id);

        for(let key in params){
            if(subsidyTypeCols.indexOf(key) >= 0){
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
            if(subsidyTypeCols.indexOf(key) >= 0){
                properties[key] = params[key];
            }
        }
        let obj = SubsidyType.create(properties);
        obj = await obj.save();
        res.json(this.reply(0, obj));
    }

    async delete(req, res, next) {
        let params = req.params;
        let id = params.id;
        if(!id || typeof(id) == 'undefined') {
            res.json(0, null);
        }
        let obj = await Models.subsidyType.get(id);
        let isDeleted = await obj.destroy();
        res.reply(0, isDeleted);
    }*/


}

