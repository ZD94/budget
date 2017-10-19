/**
 * Created by wlh on 2017/5/10.
 */


'use strict';

import {verifyToken} from 'api/auth/jwt';
import {ERR_TEXT, Reply} from "@jingli/restful";

const cache = require('common/cache')

export async function authenticate(req, res, next) {
    try {
        let token = req.headers['token'] || req.query.token;
        if (req.url.indexOf("/auth/login") > -1) {
            //不检查ticket
            return next();
        }
        let session = {};
        req.session = session;
        if (token) {
            const result = await cache.read(token);
            if (result) {
                try {
                    session = await verifyToken(token, result.appSecret);
                } catch (e) {
                    return res.json(Reply(498, null));
                }
                if (!session) {
                    return res.json(Reply(500, null));
                }
                return next();
            }
        }

        return res.sendStatus(403);
    } catch (err) {
        return next(err);
    }
}