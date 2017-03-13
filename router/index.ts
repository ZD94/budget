/**
 * Created by wlh on 2017/3/13.
 */

'use strict';

import express = require("express");
import path = require("path");
import {Models} from "../_type/index";

export interface IRestfulModule {
    get: IHttpHandler;
    update: IHttpHandler;
    create: IHttpHandler;
    delete: IHttpHandler;
}

export interface IHttpHandler {
    (req, res, next?): void;
}

export function restful(app, url, module: IRestfulModule, options: {prefix: string, middleware: IHttpHandler}) {
    let prefix = options.prefix || '/';
    let middleware = options.middleware || [];

    let url1 = path.normalize(prefix + url + '/:id');
    let url2 = path.normalize(prefix + url);
    if (module.get && typeof module.get == 'function') {
        app.get(url1, middleware, module.get);
    }
    if (module.update && typeof module.update) {
        app.post(url2, middleware, module.update); //新增
    }
    if (module.create && typeof module.create) {
        app.post(url2, middleware, module.create); //新增
    }
    if (module.delete && typeof module.delete) {
        app.delete(url1, middleware, module.delete);
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