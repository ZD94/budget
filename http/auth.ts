/**
 * Created by wlh on 2017/5/10.
 */

'use strict';

import * as moment from 'moment';
import {Models} from '_types';
import {verifyToken} from 'api/auth/jwt';
import {reply} from "@jingli/restful";
import Logger from "@jingli/logger";
const logger = new Logger("http");
import * as _ from 'lodash';

const cache = require('common/cache');
const pass_urls: (string|RegExp)[] = [
    '/auth/login',
    '/agent/gettoken',
    // /\/aircompany/i,
]

export async function authenticate(req, res, next) {
    let token = req.headers['token'] || req.query.token,
        url = req.url,
        session;

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
        req.session = session;
        // Statistics url request count
        let appId = session.sub;

        let today = moment().format('YYYYMMDD');
        try {
            let pager = await Models.statistic.find({where: {appId, day: today, url}});
            let dayStatistic;
            if (pager.length > 0) {
                dayStatistic = pager[0];
            }
            if (!dayStatistic) {
                dayStatistic = Models.statistic.create({appId, day: today, num: 0, url});
            }

            dayStatistic.num = parseInt(dayStatistic.num) + 1;
            await dayStatistic.save();
        } catch (e) {
            logger.error(e);
        } finally {
            return next()
        }
    }

    return res.sendStatus(403);
}
