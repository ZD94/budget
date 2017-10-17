/*
 * 登录验证
*/

export * from "./util";
import { Models } from "_types";
import { ERR_TEXT } from "@jingli/restful";
import { Account } from "_types/account";
import { Company } from "_types/company";
import { createTicket } from "./util";
import * as config from "@jingli/config";
let validator = require('validator');
let md5 = require("md5");

/*
 * params : {
    username,
    sigin      // 使用username, md5(password), timestamp
    timestamp
 }
*/

export async function getAccount(username: string | number) {
  let key;
  if (validator.isMobilePhone(username.toString(), 'zh-CN')) {
    key = 'mobile';
  } else {
    key = 'email';
  }

  let accounts = await Models.account.find({
    where: {
      [key]: username
    }
  });

  if (accounts.length > 1) {
    throw new Error("accounts存在多个账户");
  }

  return accounts[0];
}

export async function Login(params: {
  username: string | number;
  sign: string;
  timestamp: number;
}) {
  let { username, sign, timestamp } = params;
  let result = {
    code: 0,
    data: null,
    msg: ""
  };
  if (!username || !sign || !timestamp) {
    result.code = 502;
    return result;
  }

  let now = +new Date();
  if (Math.abs(now - timestamp) > 3 * 60 * 1000) {
    result.code = 501;
    return result;
  }

  let account;
  try {
    account = await getAccount(username);
  } catch (e) {
    console.error(e);
    result.code = 502;
    return result;
  }

  if (!account) {
    result.code = 404;
    return result;
  }

  let string = [username, account.pwd, timestamp].join("|");
  let sSign = md5(string);

  if (sSign != sign) {
    result.code = 404;
    return result;
  }

  /* ===== 认证通过 ===== */
  let ticket = await createTicket({
    sign,
    timestamp,
    account
  });

  result.code = 0;
  result.data = { ticket: { ticket, expireTimes: config.sessionTime * 60 * 1000 } };
  return result;
}

export async function getToken(proxy: string, company?: string) {
  let where = company ? { proxy, company } : { proxy }
  const warrants = await Models.warrant.find({ where });

  const { app_id, app_secret } = await Models.company.get(warrants[0].company);
  return genToken(app_id, app_secret);
}

function genToken(app_id: string, app_secret: string): string {
  return ''
}