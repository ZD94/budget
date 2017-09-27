/**
 * Created by wlh on 2017/5/10.
 */

'use strict';

import {getTicket, checkCompany} from "api/auth";
import {ERR_TEXT, Reply} from "@jingli/restful";

export async function authenticate(req, res, next) {
    let key = req.headers['key'] || req.query.key;
    let ticket = req.headers['ticket'] || req.query.ticket;

    if(key != 'jinglicloud2017'){
        return res.sendStatus(403);
    }

    if(req.url.indexOf( "/auth/login" ) > -1){
        //不检查ticket
        return next();
    }

    let session = await getTicket(ticket);
    if(!session){
        // ticket 过期
        return res.json(Reply(500, null));
    }else{
        req.session = session;
    }

    return next();
}