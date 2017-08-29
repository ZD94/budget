/**
 * Created by wlh on 2017/8/25.
 */

'use strict';

import http = require("http");
import v1 = require('./v1');

import './controller';
import {getControllers} from './decorator';

export async function initHttp(app) {
    app.use('/api/v2', v1);

    let controllers = await getControllers();
    for(let url in controllers) {
        let Controller = controllers[url];
        let methods = [];
        let prototype = Controller.prototype;
        do {
            if (prototype) {
                methods = methods.concat(Object.getOwnPropertyNames(prototype));
            }
            prototype = Object.getPrototypeOf(prototype)
        } while(prototype);

        let cls = new Controller();
        methods = methods.filter((fnName) => {
            return ['get', 'update', 'delete', 'add', 'find'].indexOf(fnName) >= 0
            || (typeof cls[fnName] == 'function' && cls[fnName].$url )
        });

        for(let fnName of methods) {
            let curUrl = url;
            let method = 'get';

            if (fnName == 'get') {
                curUrl += '/:id'
            }

            if (fnName == 'update') {
                curUrl += '/:id';
                method = 'put';
            }

            if (fnName == 'delete') {
                curUrl += '/:id';
                method = 'delete';
            }

            if (fnName == 'add') {
                method = 'post';
            }

            let fn = cls[fnName];
            console.log(fn.$url);
            if (fn.$url) {
                curUrl += fn.$url;
            }

            if (fn.$method) {
                method = fn.$method;
            }
            let oldFn = fn;
            fn = function(req, res, next) {
                let id = req.params.id;
                if (!id) {
                    return oldFn(req, res, next).bind(this);
                }
                if (!cls.$isValidId.bind(cls)(id)) {
                    if (next && typeof next == 'function') {
                        return next();
                    }
                    return res.send('Invalid Id');
                }
                return oldFn.bind(cls)(req, res, next)
            }

            //统一处理async错误
            let fn2 = fn;
            fn = function(req, res, next) {
                let ret = fn2.bind(this)(req, res, next);
                if (ret.then && typeof ret.then == 'function') {
                    return ret.catch(next);
                }
                return ret;
            }

            method = method.toLowerCase();
            app[method](curUrl, fn.bind(cls));
        }
    }
}