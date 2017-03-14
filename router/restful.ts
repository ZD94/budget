/**
 * Created by wlh on 2017/3/13.
 */

'use strict';

import path = require("path");
import {Models} from "../_type/index";

export interface IRestfulModule {
    get?: IHttpHandler;
    update?: IHttpHandler;
    create?: IHttpHandler;
    delete?: IHttpHandler;
}

export interface IHttpHandler {
    (req, res, next?): void;
}

export function restful(app, url, module: IRestfulModule, options: {prefix?: string, middleware?: IHttpHandler}) {
    let prefix = options.prefix || '/';
    let middleware = options.middleware || [];

    let urls = {
        get:    {url: '/:id', method: 'GET'},
        update: {url: '/:id', method: 'POST'},
        create: {url: '/', method: 'POST'},
        delete: {url: '/:id', method: 'DELETE'}
    }

    for(let key in module) {
        let item = urls[key];
        let fn = module[key]
        let link;
        let method;
        if (item &&  fn && typeof fn == 'function' ) {
            method = item.method ? item.method : 'GET';
            link = item.url;
        } else {
            link = fn.url;
            method = fn.method ? fn.method : 'GET';
        }

        if (link && method) {
            link = path.normalize(prefix + url + link);
            app[method.toLowerCase()](link, middleware, wrapHandleError(fn));
        }
    }
    // let url1 = path.normalize(prefix + url + '/:id');
    // let url2 = path.normalize(prefix + url);
    //
    // if (module.get && typeof module.get == 'function') {
    //     app.get(url1, middleware, wrapHandleError(module.get));
    //     // console.log(`挂载:app.get(${url1})`)
    // }
    // if (module.update && typeof module.update) {
    //     app.post(url1, middleware, wrapHandleError(module.update)); //新增
    //     // console.log(`挂载:app.post(${url1})`)
    // }
    // if (module.create && typeof module.create) {
    //     app.post(url2, middleware, wrapHandleError(module.create)); //新增
    //     // console.log(`挂载:app.post(${url2})`)
    // }
    // if (module.delete && typeof module.delete) {
    //     app.delete(url1, middleware, wrapHandleError(module.delete));
    //     // console.log(`挂载:app.delete(${url2})`)
    // }
}

function wrapHandleError(fn) {
    return function(req, res, next) {
        let ret;
        try{
            ret = fn(req, res, next);
        } catch(err) {
            return next(err);
        }

        if (ret && ret.then && typeof ret.then == "function") {
            return ret
                .catch( (err) => {
                    return next(err);
                })
        }
    }
}

export function restfulModel(app, url, model: string, options: {prefix: string, middleware: IHttpHandler}) {
    let module: IRestfulModule = {
        get: (req, res, next) => {
            let id = req.params.id;
            if (!id) {
                return res.send(getParamsError(id));
            }
            return Models[model].get(id)
                .then( (m) => {
                    res.json(m);
                })
                .catch( (err) => {
                    res.send(err);
                })
        },
        update: (req, res, next) => {
            let id = req.params.id;
            let obj = req.body;

            if (!id) {
                return res.send(getParamsError(id));
            }
            return Models[model].get(id)
                .then( (m) => {
                    if (!m) {
                        throw new Error('资源不存在');
                    }
                    for(let key in obj) {
                        m[key] = obj.key;
                    }
                    return m.save()
                })
                .then( (m) => {
                    res.json(m);
                })
                .catch( (err) => {
                    res.send(err);
                })
        },
        create: (req, res, next) => {
            let obj = req.body;
            let m = Models[model].create(obj);
            return m.save()
                .then( (m) => {
                    res.json(m);
                })
                .catch( (err) => {
                    res.send(err);
                })
        },
        delete: (req, res, next) => {
            let id = req.params.id;
            return Models[model].get(id)
                .then( (m) => {
                    return m.destroy();
                })
                .then( (m) => {
                    res.json({id: id});
                })
                .catch( (err) => {
                    res.send(err);
                })
        }
    }
    return restful(app, model, module, options);
}

function getParamsError(param: string) : string {
    return JSON.stringify({code: -1, msg: `缺少参数:${param}`});
}