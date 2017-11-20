/**
 * Created by wlh on 2017/5/10.
 */

'use strict';

import * as moment from 'moment';
import { Models } from '_types';
import { verifyToken } from 'api/auth/jwt';
import { reply } from "@jingli/restful";
import Logger from "@jingli/logger";
const logger = new Logger("http");
import * as _ from 'lodash/fp';
import { Request, Response, NextFunction } from 'express-serve-static-core';
const md5 = require('md5');
import {genSign, verifySign, sortData} from '@jingli/sign';
const cache = require('common/cache');

const pass_urls: (string | RegExp)[] = [
    /^\/auth\/login*/,
    '/agent/gettoken',
    // /\/place/i,
    // /\/aircompany/i,
]

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    let token: string = req.headers['token'] || req.query.token,
        url: string = req.url,
        session: { [key: string]: any };

    // Login
    for (let v of pass_urls) {
        if (typeof v == 'string' && v == url) {
            return next();
        }
        if (v instanceof RegExp && v.test(url)) {
            return next();
        }
    }

    if (token) {
        const result = await cache.read(token);
        if (!result) {
            return res.json(reply(498, null))
        }
        try {
            session = await verifyToken(token, result.appSecret);
        } catch (e) {
            logger.log('err:', e)
            return res.json(reply(498, null));
        }
        if (!session) {
            return res.json(reply(500, null));
        }
        req['session'] = { ...session, appSecret: result.appSecret };
        return next()
    }

    let sign: string = <string>req.headers['sign'];
    let appid: string = <string>req.headers['appid'];
    let timestamp: string = <string>req.headers['timestamp'];
    // const { appid, sign, timestamp } = req.headers
    if (!appid || !sign) {
        return res.sendStatus(403);
    }
    const companies = await Models.company.find({
        where: { appId: appid }
    });
    if (companies.length < 1) {
        return res.sendStatus(403);
    }
    const { appSecret, id } = companies[0]

    if (verifySign(getParams(req), sign, appSecret)) {
        req['session'] = { companyId: id, appSecret };
        return next();
    }
    return res.sendStatus(403);
}

function getParams(req: Request) {
    const { method } = req

    switch (method.toUpperCase()) {
        case 'GET':
            return req.query;
        case 'POST':
        case 'PUT':
            return req.body;
        case 'DELETE':
            return Object.create(null);
    }
}

async function statistic(appId: string, url: string) {
    let today = moment().format('YYYYMMDD');
    let pager = await Models.statistic.find({ where: { appId, day: today, url } });
    let dayStatistic;
    if (pager.length > 0) {
        dayStatistic = pager[0];
    }
    if (!dayStatistic) {
        dayStatistic = Models.statistic.create({ appId, day: today, num: 0, url });
    }

    dayStatistic.num = parseInt(dayStatistic.num) + 1;
    await dayStatistic.save();
}

// getSortedStr :: Object -> String
const getSortedStr = _.compose(JSON.stringify, sortData);

export function sign(data: any, appSecret: string) {
    const timestamp = Math.floor(Date.now() / 1000);
    const temp = getSortedStr(data);
    const hex = timestamp.toString(16).toUpperCase();
    return md5(Buffer.from(temp + hex + appSecret, "utf8")).toUpperCase() + hex;
}
