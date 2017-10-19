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
import { generateToken, verifyToken } from "./jwt";

const cache = require('common/cache')
let validator = require('validator');
let md5 = require("md5");

const EXPIRES = 20 * 60;

export enum AuthStatus {
    UNACTIVED = 0,
    ACTIVED = 1
}

/*
 * params : {
    username,
    sigin      // 使用username, md5(password), timestamp
    timestamp
 }
*/

export async function getAccount(username: string | number): Promise<Account> {
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

export async function signIn(params: {
    username: string | number;
    sign: string;
    timestamp: number;
}) {
    let { username, sign, timestamp } = params;
    let result = { code: 0, data: null, msg: "" };
    if (!username || !sign || !timestamp) {
        result.code = 502;
        return result;
    }
    // Verify username and password

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

    try {
        result = await getToken(account.id);
    } catch (e) {
        result.code = 500;
        return result;
    }
    return result;
}

/**
 * Generate token
 * @param {string} agent 员工编号或企业编号
 * @param {string} company 企业编号
 * @returns {Promise<{code: number; data: any; msg: string}>}
 */
export async function getToken(agent: string) {
    let res = { code: 0, data: null, msg: '' }

    // Whether authorized to the agent
    const authorizations = await Models.authorization.find({
        where: { agent, status: AuthStatus.ACTIVED }
    });
    if (authorizations.length < 0) {
        res.code = 401;
        return res;
    }

    const companyId = authorizations[0].companyId;
    const enterprise = await Models.company.get(companyId);
    if (!enterprise) {
        res.code = 401;
        return res;
    }

    const token = await generateToken({ accountId: agent, companyId }, enterprise.appId, enterprise.appSecret);
    await cache.write(token, { appSecret: enterprise.appSecret }, EXPIRES);
    res.data = { token, expires: EXPIRES };
    return res;
}

export async function getTokenByAgent(agentToken: string, companyId: string) {
    let res = { code: 0, data: null, msg: '' }
    const session = await cache.read(agentToken);
    let payload;
    try {
        payload = await verifyToken(agentToken, session.appSecret);
    } catch (e) {
        res.code = 498;
        return res;
    }

    // Whether authorized to the agent
    const authorizations = await Models.authorization.find({
        where: { agent: payload.accountId, companyId, status: AuthStatus.ACTIVED }
    });
    if (authorizations.length < 0) {
        res.code = 401;
        return res;
    }

    const enterprise = await Models.company.get(companyId);
    if (!enterprise) {
        res.code = 401;
        return res;
    }

    const token = await generateToken({
        accountId: payload.accountId,
        companyId
    }, enterprise.appId, enterprise.appSecret);
    await cache.write(token, { appSecret: enterprise.appSecret }, EXPIRES);
    res.data = { token, expires: EXPIRES };
    return res;
}
