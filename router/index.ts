/**
 * Created by wlh on 2017/3/14.
 */

'use strict';

const express = require("express");
const app = express();

import bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

import {restful} from "./restful";
import {getBudgetCache, getBudget} from "../lib/budget";

const url = '/budget';
const prefix = '/v1';
let middleware = function(req, res, next) {
    let appid = req.query.appid;
    req.appid = appid;
    next();
}

let m = {
    get: async function(req, res, next) {
        let id = req.params.id;
        let appid = req.query.appid;
        let ret = await getBudgetCache({id: id, appid: appid})
        res.json(ret);
    },
    create: async function(req, res, next) {
        let appid = req.query.appid;
        let obj = req.body.json;
        let params = JSON.parse(obj);
        let {prefers, tickets, hotels, fromCity, segs, staffs, policies, ret, combineRoom} = params
        let result = await getBudget({
            prefers,
            appid,
            tickets,
            hotels,
            fromCity,
            segs,
            staffs,
            policies,
            ret,
            combineRoom
        });
        res.json(result);
    }
}
restful(app, url, m, {prefix: prefix, middleware: middleware})

app.use(function(err, req, res, next) {
    console.log("Error:", err.stack);
    res.send({code: -1, msg: err.message});
})
// console.log("挂载: app.use(err, req, res, next)")

export=app