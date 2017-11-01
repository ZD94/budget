/**
 * Created by hxs on 2017/9/7.
 */

'use strict';

import {AbstractController, Restful, Router} from "@jingli/restful";
import {Models} from "_types";
import {signIn, getCompany, updateSession} from "api/auth";

let cache = require("common/cache");


@Restful()
export class AuthController extends AbstractController {

    $isValidId(id: string) {
        return /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(id);
    }

    /*
     * body { username, sign, timestamp }   sign 生成顺序 username, pwd, timestamp
    */
    @Router("/login", "post")
    async login(req, res, next) {
        let result;
        try {
            result = await signIn(req.body);
        } catch (e) {
            console.error(e)
            return res.json(this.reply(403, null));
        }
        return res.json(this.reply(result.code, result.data));
    }

    @Router("/quit", "post")
    async quit(req, res, next) {
        let token = req.headers['token'] || req.query.token;
        let result = await cache.remove(token);

        return res.json(this.reply(0, null));
    }
}
