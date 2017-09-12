/*
 * 登录验证
*/

export * from "./util";
import {Models} from "_types";
import {ERR_TEXT} from "@jingli/restful";
import {Account} from "_types/account";
import { Company } from "_types/company";
import { createTicket } from "./util";
let validator = require('validator');
let md5 = require("md5");


/*
 * params : {
    username,
    sigin      // 使用username, md5(password), timestamp
    timestamp
 }
*/

export async function getAccount(username:string | number){
    let key;
    if(validator.isMobilePhone(username.toString(), 'zh-CN')){
        key = 'mobile';
    }else{
        key = 'email';
    }
    
    let accounts = await Models.account.find({
        where : {
            [key] : username
        }
    });

    if(accounts.length > 1){
        throw new Error("accounts存在多个账户");
    }

    return accounts[0];
}

export async function Login(req, res, next){
    let {username, sign, timestamp} = req.body;

    if(!username || !sign || !timestamp){
        return res.sendStatus(502);
    }

    let now = +new Date();
    if(Math.abs(now - timestamp) > 5 * 1000){
        return res.sendStatus(502);
    }

    let account;
    try{
        account = await getAccount(username);
    }catch(e){
        console.error(e);
        return res.sendStatus(403);
    }
    
    if(!account){
        return res.json({
            code : 404,
            msg  : "账户不存在"
        });
    }

    let string = [username, account.pwd, timestamp].join("|");
    let sSign = md5(string);

    if(sSign != sign){
        return res.json({
            code : 404,
            msg  : "账户名密码不匹配"
        });
    }

    /* ===== 认证通过 ===== */
    let ticket = await createTicket({
        sign,
        timestamp,
        account
    });

    res.json({
        code : 0,
        msg  : "登录成功",
        data : {
            ticket
        }
    });
}
