/**
 * Created by wlh on 2017/8/25.
 */


'use strict';

import { scannerDecoration, registerControllerToRouter, batchRegisterErrorCode, ERR_TEXT, reply } from "@jingli/restful";
import { Request, Response } from "express-serve-static-core";
import path = require("path");
import express = require("express");
import { authenticate } from "./auth";
import Logger from "@jingli/logger";
import { genSign } from "@jingli/sign";
import OtherHttp from "./other";

const logger = new Logger("http");

let router = express.Router();
let routerOther = express.Router();
scannerDecoration(path.join(__dirname, 'controller'));
registerControllerToRouter(router, { isShowUrls: true });
OtherHttp(routerOther);

export interface IResponse extends Response {
    jlReply: Function;

}

export interface IRequest extends Request {
    clearTimeout: Function;
    session: any;
}

let allowOrigin = [
    "localhost",
    "jingli365",
];

function checkOrigin(origin) {
    for (let item of allowOrigin) {
        if (origin.indexOf(item) > -1) {
            return true;
        }
    }

    return false;
}

function recordLogger(req, res, next) {
    logger.log(`${req.method}  ${req.url}`)
    return next();
}

function allowCrossDomain(req, res, next) {
    if (req.headers.origin && checkOrigin(req.headers.origin)) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
    if (req.method == 'OPTIONS') {
        return res.send("OK");
    }
    next();
}


batchRegisterErrorCode({
    498: 'token不存在',
    500: 'token已失效或者不存在',
});

export async function initHttp(app) {
    app.use(recordLogger);
    app.use(jlReply);
    app.use(allowCrossDomain);
    app.use(express.static(path.join(__dirname, "www")));
    app.use(routerOther);

    let prefixUrl = '/api/v1';
    app.use(`${prefixUrl}/errorCodes`, function (req, res, next) {
        res.jlReply(reply(0, ERR_TEXT));
    })
    app.use(prefixUrl, authenticate, router);

}

export function jlReply(req, res, next) {
    res.jlReply = function (data: any) {
        try {
            let { appId, appSecret } = req.session || { appId: '00000000', appSecret: '00000000' };
            let timestamp = Math.floor(Date.now() / 1000);
            let sign = genSign(data, timestamp, appSecret);
            res.setHeader('appid', appId);
            res.setHeader('sign', sign);
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify(data));
            res.end();
        } catch (err) { 
            logger.error(err);
            return next(err);
        }
    }
    next();
}