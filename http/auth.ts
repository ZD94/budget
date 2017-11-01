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
const cache = require('common/cache');

export async function authenticate(req, res, next) {
    let token = req.headers['token'] || req.query.token,
        url = req.url,
        session;

    if (url.indexOf("/auth/login") > -1) {
        return next();
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
