/**
 * Created by dev on 2017/8/17.
 */

import { Models} from "_types";
import {TravelPolicy, SubsidyTemplate, TravelPolicyRegion, CompanyRegion, RegionPlace} from "_types/policy";
import _ = require("lodash");
import express = require("express");
// import Response = express.Response;
// import Request = express.Request;

const tableFields = {
    travelPolicy: TravelPolicy['$fieldnames'],
    travelPolicyRegion: TravelPolicyRegion['$fieldnames'],
    subsidyTemplate: SubsidyTemplate['$fieldnames'],
    companyRegion: CompanyRegion['$fieldnames'],
    regionPlace: RegionPlace['$fieldnames']
}

const ModelList = {
    travelPolicy: TravelPolicy,
    travelPolicyRegion: TravelPolicyRegion,
    subsidyTemplate: SubsidyTemplate,
    companyRegion: CompanyRegion,
    regionPlace: RegionPlace
}

const AppMehthod = {
    find: "find",
    get: "get",
    create: "create",
    update: "update",
    delete: "delete"
}

export interface Response {
    reply: ({code: number, msg:string, data: any}) => void;
}

export interface Request {
    appid: string;
    query?:any
}

export function Router(path, method, options) {
    return function(fnName, obj, desc) {
        let fn = desc.value;
        fn.path = path;
        fn.method = method;
        fn.options = options;
    }
}


export function modelRestfulHelper(model, options) {
    let mountUrl = "/" + model;
    let methods = options.methods;
    return async function(app) {
        if (!methods || (methods && methods.indexOf("find") >= 0)) {
            let url = mountUrl;
            let offset = 0;
            let limit = 12;

            //find
            app.get(url,  async (req: Request, res: Response, next) => {
                //请求参数中添加page, 表示请求页数
                let params = req.query;
                let query = {where:{}};
                for(let key in params){
                    if(tableFields[model].indexOf(key) >= 0){
                        query.where[key] = params[key];
                    }
                }
                if(!query['order'] || query['order'] == undefined)
                    query["order"] = [["createdAt", "desc"]];
                if(!query['limit'] || query['limit'] == undefined)
                    query["limit"] = limit;

                let result = await Models[model].all(query);
                result = await transformModelToObject(result, model)
                res.reply({code: 0, msg:'', data: result});
            });
        }
        
        if (!methods || (methods && methods.indexOf("get") >= 0)) {
            let url = mountUrl + "/:id"
            app.get(url,  async (req, res, next) => {
                let params = req.params;
                let query = {where:{id: params.id}};
                let result = await Models[model].all(query);
                result = await transformModelToObject(result,model);
                res.reply({code: 0, msg:'', data: result});
            });

        }

        if (!methods || (methods && methods.indexOf("delete")) >= 0) {
            let url = mountUrl + "/:id"
            app.delete(url,  async (req, res, next) => {
                let params = req.params;
                let query = {where:{id: params.id}};

                let result = await Models[model].all(query);
                result = await transformModelToObject(result,model);
                res.reply({code: 0, msg:'', data: result});
            });

        }

        //update
        if (!methods || (methods && methods.indexOf("update")) >= 0) {
            let url = mountUrl;
            app.put(url,  async (req, res, next) => {
                console.log("====>body:,model", req.body, model);
                let params = req.body;
                let id = params.id ;
                if(!id || typeof(id) == 'undefined') {
                    res.reply({code: 0, msg:'更新对象id不存在', data: null});
                }
                let obj = await Models[model].get(id);

                for(let key in params){
                    if(tableFields[model].indexOf(key) >= 0){
                        obj[key] = params[key];
                    }
                }

                obj = await obj.save();
                let result = await transformModelToObject(obj,model);
                console.log("===========>result: ", result);
                res.reply({code: 0, msg:'', data: result});
            });
        }

        if (!methods || (methods && methods.indexOf("create")) >= 0) {
            let url = mountUrl;
            app.post(url,  async (req, res, next) => {
                let params = req.body;
                let properties = {};
                for(let key in params){
                    if(tableFields[model].indexOf(key) >= 0){
                        properties[key] = params[key];
                    }
                }
                let obj = ModelList[model].create(properties);
                obj = await obj.save();

                let result = await transformModelToObject(obj,model);
                res.reply({code: 0, msg:'', data: result});
            });
        }
    }
}


export async function transformModelToObject(obj: any, model:string){
    let result: any;
    if(typeof obj == 'string'){
        obj = JSON.parse(obj);
    }
    let modelCols = tableFields[model];

    if(_.isArray(obj)){
        result = [];
        for(let i = 0; i< obj.length; i++){
            let desiredObj = {};
            for(let j = 0; j < modelCols.length; j++){
                desiredObj[modelCols[j]] = obj[i][modelCols[j]];
            }

            if(desiredObj){
                result.push(desiredObj);
            }
        }
        return result;
    }
    result = {};
    for(let i = 0; i < modelCols.length; i++){
        result[modelCols[i]] = obj[modelCols[i]]
    }
    return result;
}




