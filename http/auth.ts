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

    const { appid, sign, timestamp } = req.headers
    if (!appid || !sign || !timestamp) {
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

export function genSign(params: object, timestamp: number, appSecret: string) {
    const temp = getSortedStr(params);
    const hex = timestamp.toString(16).toUpperCase();
    return md5(Buffer.from(temp + hex + appSecret, "utf8")).toUpperCase() + hex;
}

export function sign(data: any, appSecret: string) {
    const timestamp = Math.floor(Date.now() / 1000);
    const temp = getSortedStr(data);
    const hex = timestamp.toString(16).toUpperCase();
    return md5(Buffer.from(temp + hex + appSecret, "utf8")).toUpperCase() + hex;
}

/**
 * 校验签名
 * @param params 
 * @param sign 
 * @param appSecret 
 */
export function verifySign(params: object, sign: string, appSecret: string) {
    if (sign.length != 40) {
        return false;
    }

    // Verify the expires
    const hex = sign.substr(-8);
    const time = parseInt(hex, 16);
    if (Date.now() / 1000 - time > 500 * 60) {
        return false;
    }

    // Compare signature
    const signature = genSign(params, time, appSecret)
    return sign == signature;
}

function sortData(data: object): object {
    if (!isObject(data)) {
        return data
    }
    const keys = Object.keys(data)
    const result = Object.create(null)
    keys.sort()
    keys.forEach(k => {
        let val = data[k]
        if(isObject(val)){
            if(val.toJSON && typeof val.toJSON == 'function'){
                val = val.toJSON()
            }
            val = sortData(val)
        }
        result[k] = val
    })
    return result;
}

function isObject(obj) {
    return Object.prototype.toString.bind(obj).call() == '[object Object]'
}