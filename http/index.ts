/**
 * Created by wlh on 2017/8/25.
 */

'use strict';

import http = require("http");

import {scannerDecoration, registerControllerToRouter} from "@jingli/restful";

import path = require("path");
import express = require("express");
import {authenticate} from "./auth";

let router = express.Router();

scannerDecoration(path.join(__dirname, 'controller'));
registerControllerToRouter(router);

let allowOrigin = [
    "localhost",
    "jingli365"
];

function checkOrigin( origin ){
    console.log("checkOrigin===>", origin);
    for(let item of allowOrigin){
        if(origin.indexOf(item) > -1){
            return true;
        }
    }

    return false;
}

export async function initHttp(app) {
    app.get("/gg", (req, res, next)=>{
        if(req.headers.origin && checkOrigin(req.headers.origin)){
            console.log("show ok :  ", req.headers.origin);
            res.header('Access-Control-Allow-Origin', req.headers.origin);
        }
        res.header('Access-Control-Allow-Methods', '*');
        res.header('Access-Control-Allow-Headers', '*');

        res.json({
            code:0,
            data:"good man"
        })
    });
    app.use('/api/v1', (req, res, next)=>{
        if(req.headers.origin && checkOrigin(req.headers.origin)){
            console.log("show ok :  ", req.headers.origin);
            res.header('Access-Control-Allow-Origin', req.headers.origin);
        }
        res.header('Access-Control-Allow-Methods', '*');
        res.header('Access-Control-Allow-Headers', '*');
        next();
    });
    app.use('/api/v1', authenticate, router);
}