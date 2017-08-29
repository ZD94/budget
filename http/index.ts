/**
 * Created by wlh on 2017/8/25.
 */

'use strict';

import http = require("http");

import {scannerControllers} from "./core/decorator";
import {registerControllerToRouter} from "./core/router/index";

import path = require("path");
scannerControllers(path.join(__dirname, 'controller'));

import express = require("express");
var router = express.Router();
registerControllerToRouter(router);

export async function initHttp(app) {
    // app.use('/api/v1', v1);
    app.use('/api/v1', router);
}