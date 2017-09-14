/**
 * Created by wlh on 2017/5/10.
 */

'use strict';

//
// import util = require("./util")
//
// import Code = require("./code");
// import {Models} from "_types";
// import moment = require("moment");
//
// export = function(req, res, next) {
//     let ret = (async function(req, res, next) {
//         let secret;
//         let {appid, sign, timestamp, agentid} = req.headers;
//         if (!timestamp) {
//             var codeNo = 502;
//             return res['openapiRes'](codeNo, 'TIMESTAMP NOT EXIST', null);
//         }
//
//         if (!appid) {
//             var codeNo = 502;
//             return res['openapiRes'](codeNo, 'APP_ID INVALID', null);
//         }
//         //如果agentid存在直接使用agent 账号和秘钥检验
//         let signId = agentid || appid;
//         let app = await Models.app.get(signId);
//         if (!app) {
//             return res['openapiRes'](502, 'APP_ID INVALID', null);
//         }
//         if (app.expireDate && app.expireDate < new Date()) {
//             var codeNo = 600;
//             return res['openapiRes'](codeNo, Code[codeNo], null);
//         }
//         secret = app.secretKey;
//         return handleData(req, async ()=> {
//             let data = req.json || req.query;
//             let code = util.verifySign({secret, timestamp, sign, data})
//             if (code) {
//                 return res['openapiRes'](code, 'SIGN ERROR', {});
//             }
//             if (agentid) {
//                 app = await Models.app.get(appid);
//                 if (!app || app.agentId == agentid) {
//                     return res['openapiRes'](403, 'Permission Deny', {});
//                 }
//             }
//             req.appid = app.id;
//             return next();
//         });
//     })(req, res, next);
//
//     //捕获错误
//     return ret.catch((err) => {
//         console.error("认证错误:==>", err);
//         next(err);
//     });
// }
//
// function handleData(req, cb) {
//     let method = req.method.toLowerCase()
//     if ( method == 'post') {
//         let data = [];
//         let str;
//         req.on('data', (chunk) => {
//             data.push(chunk);
//         })
//         req.on('end', () => {
//             str = data.join("").toString()
//             req.json = JSON.parse(str);
//             cb();
//         });
//         return;
//     } else if ( method == 'get') {
//         req.json = req.query;
//         cb();
//         return;
//     }
//     return cb();
// }

export function authenticate(req, res, next) {
    let key = req.headers['key'] || req.query.key;
    if (key == 'jinglicloud2017') {
        return next();
    }
    res.sendStatus(403);
}