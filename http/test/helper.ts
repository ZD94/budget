/**
 * Created by wlh on 2017/11/1.
 */

'use strict';

var host = 'http://localhost:4003';
var prefix = '/api/v1'
import fs = require("fs");
import md5 = require("md5");
import request = require("request");

let storage = {
    filename: 'token.txt',
    write: function (data: Object) { 
        //写入文件
        fs.writeFileSync(this.filename, JSON.stringify(data));
    },
    read: function (): Object { 
        try {
            var bfs = fs.readFileSync(this.filename)
            return JSON.parse(bfs.toString());
        } catch (err) { 
            return null;
        }
    }
};

export interface TokenStruct { 
    token: string;
    expireDateTime: Date| string;
}

export async function getToken() { 
    //缓存有，直接通过
    let obj = storage.read() as TokenStruct;
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

    return new Promise<TokenStruct>((resolve, reject) => { 
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
            let ret: TokenStruct = {
                token: result.data.token,
                expireDateTime: null,
            }
            ret.expireDateTime = new Date((result.data.expires - 30) * 60 + Date.now());
            storage.write(ret);
            return resolve(ret as TokenStruct);
        });
    })
}

export function getFullPath(url: string) {
    let fullUrl =  host + prefix + url;
    return fullUrl;
}

export function setTokenExpire() { 
    return storage.write({})
}