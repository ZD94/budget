/**
 * Created by wlh on 2017/8/25.
 */

'use strict';

import http = require("http");

import {scannerControllers, registerControllerToRouter} from "@jingli/restful";

import path = require("path");
import express = require("express");
import {authenticate} from "./auth";
var router = express.Router();

scannerControllers(path.join(__dirname, 'controller'));
registerControllerToRouter(router);

export async function initHttp(app) {
    app.use('/api/v1', authenticate, router);
    // app.use('/api/v1', v1);
}