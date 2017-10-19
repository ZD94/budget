/**
 * Created by hxs on 2017/9/7.
 */

'use strict';

import { AbstractController, Restful, Router } from "@jingli/restful";
import { Models } from "_types";
import { Login, SignIn, getCompany, updateSession } from "api/auth";

let cache = require("common/cache");


@Restful()
export class AuthController extends AbstractController {

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
  async login(req, res, next) {
    let result;
    try {
      // result = await Login(req.body);
      result = await SignIn(req.body);
    } catch (e) {
      console.error(e)
      return res.json(this.reply(403, null));
    }
    return res.json(this.reply(result.code, result.data));
  }

  @Router("/quit", "post")
  async quit(req, res, next) {
    let ticket = req.headers['ticket'] || req.query.ticket;
    let result = await cache.remove(ticket);

    return res.json(this.reply(0, null));
  }
}
