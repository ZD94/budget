/**
 * Created by hxs on 2017/9/7.
 */

'use strict';

import {AbstractController, Restful, Router} from "@jingli/restful";
import {Models} from "_types";
import { signIn } from "api/auth";
import { Request, Response, NextFunction } from 'express-serve-static-core';

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
    async login(req: Request, res, next: NextFunction) {
        let result;
        try {
            result = await signIn(req.body);
        } catch (e) {
            console.error(e)
            return res.jlReply(this.reply(403, null));
        }
        return res.jlReply(this.reply(result.code, result.data));
    }

    @Router("/quit", "post")
    async quit(req: Request, res, next: NextFunction) {
        let token = req.headers['token'] || req.query.token;
        await cache.remove(token);
        return res.jlReply(this.reply(0, null));
    }
}
