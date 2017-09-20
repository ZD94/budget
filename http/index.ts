/**
 * Created by wlh on 2017/8/25.
 */

'use strict';

import http = require("http");

import {scannerControllers, registerControllerToRouter} from "@jingli/restful";

import path = require("path");
import express = require("express");
import {authenticate} from "./auth";

let router = express.Router();

scannerControllers(path.join(__dirname, 'controller'));
registerControllerToRouter(router);

let allowOrigin = [
    "localhost:4002",
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
        res.header('Access-Control-Allow-Headers', '*');
        next();
    });
    app.use('/api/v1', authenticate, router);
    // app.use('/api/v1', v1);
}