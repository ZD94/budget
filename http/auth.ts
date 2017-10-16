/**
 * Created by wlh on 2017/5/10.
 */

'use strict';

import {getTicket, checkCompany} from "api/auth";
import {ERR_TEXT, Reply} from "@jingli/restful";

export async function authenticate(req, res, next) {
    try {
        let key = req.headers['key'] || req.query.key;
        let ticket = req.headers['ticket'] || req.query.ticket;
        if (req.url.indexOf("/auth/login") > -1) {
            //不检查ticket
            return next();
        }
        let session = {};
        req.session = session;
        if (ticket) {
            session = await getTicket(ticket);
            if (!session) {
                return res.json(Reply(500, null));
            }
            return next();
        }
        if (key && key == 'jinglicloud2017') {
            req.session.accountId = 'e95df65c-6316-4517-9bfe-5605218d6908';
            return next();
        }
        return res.statusCode(403);
    } catch (err) { 
        return next(err);
    }
}