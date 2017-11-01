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
const validator = require('validator');
const md5 = require("md5");

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

/**
 * Find account by username
 * @param {string | number} username
 * @returns {Promise<Account>}
 */
export async function getAccount(username: string | number): Promise<Account> {
    let key = validator.isMobilePhone(username.toString(), 'zh-CN')
        ? 'mobile'
        : 'email';

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

    let tmp = md5([username, account.pwd, timestamp].join("|"));

    if (tmp != sign) {
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

    const token = await generateToken({
        companyId,
        accountId: agent
    }, enterprise.appId, enterprise.appSecret);

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
    let res = {code: 0, data: null, msg: ''};
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

    if (!enterprise) {
        res.code = 401;
        return res;
    }

    // Whether authorized to the agent
    const authorizations = await Models.authorization.find({
        where: {
            companyId,
            agent: payload.companyId,
            status: AuthStatus.ACTIVED
        }
    });

    const hasPermission = authorizations.length > 0;

    // Highest authority
    if (enterprise.type == CompanyType.SYSTEM) {
        // If authorization table doesn't have the record, insert it.
        if (!hasPermission) {
            const entity = Models.authorization.create({
                companyId,
                agent: payload.companyId,
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
        companyId,
        accountId: payload.accountId
    }, enterprise.appId, enterprise.appSecret);

    await cache.write(token, {appSecret: enterprise.appSecret}, EXPIRES);
    res.data = {token, expires: EXPIRES};
    return res;
}

/**
 * 授权代理商
 * @param {string} agentId 代理商
 * @param {string} companyId 企业
 * @returns {Promise<{code: number; data: any; msg: string}>}
 */
export async function authorizeTo(agentId: string, companyId: string) {
    let res = {code: 0, data: null, msg: ''};

    const unValid = agentId == void 0
        || validator.isEmpty(agentId)
        || companyId == void 0
        || validator.isEmpty(companyId);

    if (unValid) {
        res.code = 400;
        return res;
    }

    const entity = Models.authorization.create({
        companyId,
        agent: agentId,
        status: AuthStatus.ACTIVED
    });
    await entity.save();

    return res;
}
