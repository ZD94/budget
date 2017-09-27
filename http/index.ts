/**
 * Created by wlh on 2017/8/25.
 */

'use strict';

import http = require("http");

import {scannerDecoration, registerControllerToRouter, Reply} from "@jingli/restful";

import path = require("path");
import express = require("express");
import {authenticate} from "./auth";
import {checkCompany} from "api/auth";

let router = express.Router();

scannerDecoration(path.join(__dirname, 'controller'));
registerControllerToRouter(router);

let allowOrigin = [
    "localhost",
    "jingli365"
];

function checkOrigin( origin ){
    for(let item of allowOrigin){
        if(origin.indexOf(item) > -1){
            return true;
        }
    }

    return false;
}

export async function initHttp(app) {
    app.use('/api/v1', (req, res, next)=>{
        if(req.headers.origin && checkOrigin(req.headers.origin)){
            res.header('Access-Control-Allow-Origin', req.headers.origin);
        }
        res.header('Access-Control-Allow-Methods', '*');
        res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
        next();
    });
    
    app.use('/api/v1', authenticate, router);
    router.param("companyId", async (req, res, next, value)=>{
        let { accountId } = req["session"];
        
        //如果存在companyId参数，验证companyId是否属于该accountId
        let companyCheck = await checkCompany(accountId , value);
        if(!companyCheck){
            return res.json(Reply(403, null));
        }
        next();
    });
}