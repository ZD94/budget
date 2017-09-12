/**
 * Created by hxs on 2017/9/7.
 */

'use strict';

import {AbstractController, Restful, Router} from "@jingli/restful";
import {Models} from "_types";
import { Login } from "api/auth";
let cache = require("common/cache");


@Restful()
export class AuthController extends AbstractController{

    constructor() {
        super();
    }

    $isValidId(id: string) {
        return /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(id);
    }

    /*
     * body { username, sign, timestamp }   sign 生成顺序 username, pwd, timestamp
    */
    @Router("/login", "post")
    async login(req, res, next){
        await Login(req, res, next);
    }

    @Router("/loginout", "post")
    async quite(req, res, next){
        let ticket = req.headers['ticket'] || req.query.ticket;
        let result = await cache.remove(ticket);

        res.json(this.reply(0, null));
    }
}
