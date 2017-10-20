/*
 * 登录验证
*/


export * from "./util";
import {Models} from "_types";
import {ERR_TEXT} from "@jingli/restful";
import {Account} from "_types/account";
import {Company} from "_types/company";
import {createTicket} from "./util";
import * as config from "@jingli/config";
import {generateToken, verifyToken} from "./jwt";

const cache = require('common/cache')
let validator = require('validator');
let md5 = require("md5");

const EXPIRES = config.sessionTime * 60;

export enum AuthStatus {
    UNACTIVED = 0,
    ACTIVED = 1
}

export enum CompanyType {
    GENERAL = 1,
    PROXY = 2,
    SYSTEM = 3
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

/**
 * 用户登录
 * @param {{username: (string | number); sign: string; timestamp: number}} params
 * @returns {Promise<{code: number; data: any; msg: string}>}
 */
export async function signIn(params: {
    username: string | number;
    sign: string;
    timestamp: number;
}) {
    let {username, sign, timestamp} = params;
    let result = {code: 0, data: null, msg: ""};
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
 * 授权代理商
 * @param {string} agentId 代理商
 * @param {string} companyId 企业
 * @returns {Promise<{code: number; data: any; msg: string}>}
 */
export async function authorizeProxyTo(agentId: string, companyId: string) {
    let res = {code: 0, data: null, msg: ''}
    if (!agentId || agentId == '' || !companyId || companyId == '') {
        res.code = 400;
        return res;
    }
    const entity = Models.authorization.create({
        agent: agentId,
        companyId,
        status: AuthStatus.ACTIVED
    });
    await entity.save();
    return res;
}

/**
 * Generate token
 * @param {string} agent 员工编号或企业编号
 * @param {string} company 企业编号
 * @returns {Promise<{code: number; data: any; msg: string}>}
 */
export async function getToken(agent: string) {
    let res = {code: 0, data: null, msg: ''}

    // Whether authorized to the agent
    const authorizations = await Models.authorization.find({
        where: {agent, status: AuthStatus.ACTIVED}
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

    const token = await generateToken({accountId: agent, companyId}, enterprise.appId, enterprise.appSecret);
    await cache.write(token, {appSecret: enterprise.appSecret}, EXPIRES);
    res.data = {token, expires: EXPIRES};
    return res;
}

/**
 * 代理商换取企业 token
 * @param {string} agentToken 代理商 token
 * @param {string} companyId 企业 id
 * @returns {Promise<{code: number; data: any; msg: string}>}
 */
export async function getTokenByAgent(agentToken: string, companyId: string) {
    let res = {code: 0, data: null, msg: ''}
    const session = await cache.read(agentToken);
    if (!session) {
        res.code = 498;
        return res;
    }
    let payload;
    try {
        payload = await verifyToken(agentToken, session.appSecret);
    } catch (e) {
        res.code = 498;
        return res;
    }

    let enterprise = await Models.company.get(companyId);

    console.log('enterprise:', enterprise.type);

    if (!enterprise) {
        res.code = 401;
        return res;
    }

    // Whether authorized to the agent
    const authorizations = await Models.authorization.find({
        where: {agent: payload.companyId, companyId, status: AuthStatus.ACTIVED}
    });

    const hasPermission = authorizations.length > 0;

    if (enterprise.type == CompanyType.SYSTEM) {
        if (!hasPermission) {
            const entity = Models.authorization.create({
                agent: payload.companyId,
                companyId,
                status: AuthStatus.ACTIVED
            });
            await entity.save();
        }
    } else {
        if (!hasPermission) {
            res.code = 401;
            return res;
        }
    }


    const token = await generateToken({
        accountId: payload.accountId,
        companyId
    }, enterprise.appId, enterprise.appSecret);
    await cache.write(token, {appSecret: enterprise.appSecret}, EXPIRES);
    res.data = {token, expires: EXPIRES};
    return res;
}
