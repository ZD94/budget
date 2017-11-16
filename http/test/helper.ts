/**
 * Created by wlh on 2017/11/1.
 */

'use strict';

var host = 'http://localhost:4003';
var prefix = '/api/v1'
import fs = require("fs");
import md5 = require("md5");
import request = require("request");
import { verifySign } from 'http/auth';
import * as _ from 'lodash/fp';

let storage = {
    filename: `${__dirname}/token.txt`,
    write: function (data: Object) {
        //写入文件
        fs.writeFileSync(this.filename, JSON.stringify(data));
    },
    read() {
        try {
            var bfs = fs.readFileSync(this.filename)
            return JSON.parse(bfs.toString());
        } catch (err) {
            return null;
        }
    }
};

export interface TokenStructure {
    token: string;
    expireDateTime: Date | string;
}

export async function getToken() {
    //缓存有，直接通过
    let obj = storage.read() as TokenStructure;
    if (obj) {
        if (typeof obj.expireDateTime == 'string') {
            obj.expireDateTime = new Date(obj.expireDateTime);
            if (obj.expireDateTime > new Date()) {
                return obj.token;
            }
        }
    }

    //account 都是创建人
    let account = {
        username: 'qmtrip@jingli365.com',
        password: '123456'
    }

    account.password = md5(account.password);
    let timestamp = Date.now();
    let string = [account.username, account.password, timestamp].join("|");
    let sign = md5(string);

    return new Promise<string>((resolve, reject) => {
        request.post(getFullPath("/auth/login"), {
            form: {
                sign,
                username: account.username,
                timestamp
            }
        }, function (err, httpResponse, body) {
            if (err) {
                return reject(err);
            }
            let result;
            try {
                result = JSON.parse(body);
            } catch (e) {
                result = body;
            }
            if (result.code) {
                var e = new Error(result.data.msg);
                e['code'] = result.data.code;
                return reject(e);
            }
            let ret: TokenStructure = {
                token: result.data.token,
                expireDateTime: null,
            }
            ret.expireDateTime = new Date((result.data.expires - 30) * 60 + Date.now());
            storage.write(ret);
            return resolve(ret.token);
        });
    })
}

export function getFullPath(url: string) {
    let fullUrl = host + prefix + url;
    return fullUrl;
}

export function setTokenExpire() {
    return storage.write({})
}

export const validate = (target: Array<string>, source: Array<string>) => {
    const missingFields = [],
        extraFields = []

    source.forEach(v => {
        if (target.indexOf(v) < 0) {
            missingFields.push(v)
        }
    })

    target.forEach(v => {
        if (source.indexOf(v) < 0) {
            extraFields.push(v)
        }
    })
    return [missingFields.length < 1, missingFields, extraFields]
}

export const APP_SECRET = '6c8f2cfd-7aa4-48c7-9d5e-913896acec12'

export function verifyReturnSign(result: ResponseEntity, secret: string = APP_SECRET) {
    if (!result.sign) return false

    const data = _.omit('sign', result)
    return verifySign(data, result.sign, secret)
}

export interface ResponseEntity {
    code: number;
    msg: string;
    responseTime: number;
    data: any;
    sign: string;
}
