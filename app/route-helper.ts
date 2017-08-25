/**
 * Created by dev on 2017/8/17.
 */

import { Models} from "_types";
import {TravelPolicy, SubsidyTemplate, TravelPolicyRegion, CompanyRegion, RegionPlace} from "_types/policy";
var _ = require("lodash");
import {Pager} from "common/model/pager"


const tableFields = {
    travelPolicy: TravelPolicy['$fieldnames'],
    travelPolicyRegion: TravelPolicyRegion['$fieldnames'],
    subsidyTemplate: SubsidyTemplate['$fieldnames'],
    companyRegion: CompanyRegion['$fieldnames'],
    regionPlace: RegionPlace['$fieldnames']
}
// console.log(tableFields);

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


export function Router(path, method, options) {
    return function(fnName, obj, desc) {
        let fn = desc.value;
        fn.path = path;
        fn.method = method;
        fn.options = options;
    }
}

var counter = 0;

export function modelRestfulHelper(model, options) {
    let mountUrl = "/" + model;
    let methods = options.methods;
    // let query = options.query;
    return async function(app) {
        if (!methods || (methods && methods.indexOf("find") >= 0)) {
            let url = mountUrl;
            let offset = 0;
            let limit = 12;
            
            app.get(url,  async (req, res, next) => {
                let params = req.query;
                let query = {where:{}};
                for(let key in params){
                    if(tableFields[model].indexOf(key) >= 0){
                        query.where[key] = params[key];
                    }
                }
                if(!query['order'] || query['order'] == undefined) query["order"] = [["createdAt", "desc"]];
                if(!query['limit'] || query['limit'] == undefined) query["limit"] = limit;
                console.log("===>query: ", query);
                let result = await Models[model].all(query);
                result = await transformModelToObject(result,model);
                res["openapiRes"]({code: 0, msg:'', data: result});
            });
        }
        //get
        if (!methods || (methods && methods.indexOf("get") >= 0)) {
            let url = mountUrl + "/:id"
            app.get(url,  async (req, res, next) => {
                let params = req.params;
                let query = {where:{id: params.id}};

                let result = await Models[model].all(query);
                result = await transformModelToObject(result,model);
                res["openapiRes"]({code: 0, msg:'', data: result});
            });

        }

        if (!methods || (methods && methods.indexOf("delete")) >= 0) {
            let url = mountUrl + "/:id"
            app.delete(url,  async (req, res, next) => {
                let params = req.params;
                let query = {where:{id: params.id}};

                let result = await Models[model].all(query);
                result = await transformModelToObject(result,model);
                res["openapiRes"]({code: 0, msg:'', data: result});
            });

        }

        //update
        if (!methods || (methods && methods.indexOf("update")) >= 0) {
            let url = mountUrl;
            app.put(url,  async (req, res, next) => {

                let params = req.params;
                let id = params.id ;
                if(!id || typeof(id) == 'undefined') {
                    res["openapiRes"]({code: 0, msg:'更新对象id不存在', data: result});
                }
                let obj = await Models[model].get(id);

                for(let key in params){
                    if(tableFields[model].indexOf(key) >= 0){
                        obj[key] = params[key];
                    }
                }
                obj = await obj.save();
                let result = await transformModelToObject(obj,model);
                res["openapiRes"]({code: 0, msg:'', data: result});
            });
        }

        if (!methods || (methods && methods.indexOf("create")) >= 0) {
            let url = mountUrl;
            app.delete(url,  async (req, res, next) => {
                let params = req.params;
                let properties = {};
                for(let key in params){
                    if(tableFields[model].indexOf(key) >= 0){
                        properties[key] = params[key];
                    }
                }
                let obj = ModelList[model].create(properties);
                obj = await obj.save();

                let result = await transformModelToObject(obj,model);
                res["openapiRes"]({code: 0, msg:'', data: result});
            });
        }
    }
}


// export function modelRestfulHelper(model, options) {
//     let mountUrl = "/" + model;
//     let methods = options.methods;
//     let query = options.query;
//     return async function(app) {
//         if (methods && (methods && methods.indexOf("find") >= 0)) {
//             let url = mountUrl;
//             for(let i = 0; i< query.length; i++){
//                 if(query[i] != 'id' && tableFields[model].indexOf(query[i])){
//                     url = url + "/:" + query[i] ;
//                     await registerFind({app: app, model: model, method:"get", path: url});
//                 }
//             }
//         }
//         //get or delete
//         if (methods && (methods && methods.indexOf("get") >= 0)) {
//             for(let i = 0; i< query.length; i++){
//                 if(query[i] == 'id' && tableFields[model].indexOf(query[i])) {
//                     let url = mountUrl + "/:id";
//                     await registerGetOrDelete({app: app, model: model, method: "get", path: url});
//                 }
//             }
//         }
//
//         if (methods && (methods && methods.indexOf("delete")) >= 0) {
//             for(let i = 0; i< query.length; i++){
//                 if(query[i] == 'id' && tableFields[model].indexOf(query[i])) {
//                     let url = mountUrl + "/:" + query[i];
//                     await registerGetOrDelete({app: app, model: model, method: "delete", path: url});
//                 }
//             }
//         }
//
//         //create or update
//         if (methods && (methods && methods.indexOf("update")) >= 0) {
//             for(let i = 0; i< query.length; i++){
//                 if(query[i] == 'id' && tableFields[model].indexOf(query[i])) {
//                     let url = mountUrl + "/:id";
//                     await registerUpdateOrCreate({app: app, model: model, method: "post", path: url});
//                 }
//             }
//         }
//
//         if (methods && (methods && methods.indexOf("create")) >= 0) {
//             for(let i = 0; i< query.length; i++){
//                 if(query[i] == 'id' && tableFields[model].indexOf(query[i])) {
//                     let url = mountUrl + "/:id*?";
//                     await registerUpdateOrCreate({app: app, model: model, method: "put", path: url});
//                 }
//             }
//         }
//     }
// }
// export async function registerFind(params) {
//     let {app, path,model,method} = params;
//
//     console.log("======> params.path: ", params.path);
//     app[method](path,  async (req, res, next) => {
//         let params = req.params;
//         let query = {where:{$or:[]}};
//         for(let key in params) {
//             if (tableFields[model].indexOf(key) >= 0 && params[key]) {
//                 let field = {};
//                 field[key] = params[key];
//                 query["where"]["$or"].push(field);
//             }
//         }
//         if(!query['order'] || query['order'] == undefined) query["order"] = [["createdAt", "desc"]];
//         let result = await Models[model].all(query);
//         result = await transformModelToObject(result,model);
//         res["openapiRes"]({code: 0, msg:'', data: result});
//     });
// }
// export async function registerGetOrDelete(params) {
//     let {app, path,model,method} = params;
//     app[method](path, async (req, res, next) => {
//         let params = req.params;
//         let result:any;
//         for(let key in params) {
//             if (tableFields[model].indexOf(key) >= 0) {
//                  result = await Models[model].get(params[key]);
//             }
//         }
//         if(AppMehthod[method] == AppMehthod.get){
//             res["openapiRes"]({code:0, msg:'', data: await transformModelToObject(result,model)});
//         }
//         if(AppMehthod[method] == AppMehthod.delete){
//             await result.destory();
//             res["openapiRes"]({code: 0, msg: '', data: true});
//         }
//         res["openapiRes"]({code: 0 , msg: 'Bad Request', data: null});
//     });
// }
// export async function registerUpdateOrCreate(params) {
//     let {app, path,model,method} = params;
//     app[method](path, async (req, res, next) => {
//         let {id} = req.params;
//         let result: any;
//
//         if( id && (id != undefined) && AppMehthod[method] == AppMehthod.update){
//             result = await Models[model].get(id);
//             for(let key in result){
//                 result[key] = params[key];
//             }
//             result = await result.save();
//             res["openapiRes"]({code:0, msg: '', data: result});
//         }
//
//         if((!id || id == undefined) && AppMehthod[method] == AppMehthod.create){
//             result = ModelList[model].create(params);
//             result = await result.save();
//             res["openapiRes"]({code:0, msg: '', data: result});
//         }
//         res["openapiRes"]({code: 0 , msg: 'Bad Request', data: null});
//     });
// }


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
            // for(let key in obj[i]){
            //     if(tableFields[model].indexOf(key) >= 0){     //obj[0]是pager对象，无法使用let key in obj[i]
            //         console.log(key);
            //         desiredObj[key] = obj[i][key];
            //     }
            // }

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
    // for(let key in obj){
    //     if(tableFields[model].indexOf(key) >= 0){
    //         result[key] = obj[key];
    //     }
    // }
    return result;
}




