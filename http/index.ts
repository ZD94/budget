/**
 * Created by wlh on 2017/8/25.
 */


'use strict';

import http = require("http");

import {scannerDecoration, registerControllerToRouter, batchRegisterErrorCode, ERR_TEXT, reply} from "@jingli/restful";

import path = require("path");
import express = require("express");
import {authenticate} from "./auth";


let router = express.Router();

scannerDecoration(path.join(__dirname, 'controller'));
registerControllerToRouter(router, {isShowUrls: true});

let allowOrigin = [
    "localhost",
    "jingli365",
];

function checkOrigin( origin ){
    for(let item of allowOrigin){
        if(origin.indexOf(item) > -1){
            return true;
        }
    }

    return false;
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

function validCompanyId(req, res, next, companyId) { 
        if (!companyId) {
            return next();
        }

        /* let { accountId } = req["session"];
        
        //如果存在companyId参数，验证companyId是否属于该accountId
        let companyCheck = await checkCompany(accountId , value);
        if(!companyCheck){
            return res.json(Reply(403, null));
        } */
        next();
}

batchRegisterErrorCode({
    498: 'token不存在',
    500: 'token已失效或者不存在',
});

export async function initHttp(app) {
    router.param("companyId", validCompanyId);
    app.use('/api/v1', allowCrossDomain);
    app.use('/api/v1/errorCodes', function(req, res, next) {
        res.json(reply(0, ERR_TEXT));
    })
    app.use('/api/v1', authenticate, router);
}