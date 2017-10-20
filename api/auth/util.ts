let cache = require("common/cache");
let uuid = require("uuid");
let md5  = require("md5");
import L from "@jingli/language";
import * as config from "@jingli/config";
import { Models } from "_types";
import {Account} from "_types/account";
import {Company} from "_types/company";
/*
 * redis 记录 account, company
*/
const SESSIONTIME = config.sessionTime * 60;

export async function createTicket (params:{
    "timestamp" : number,
    "sign": string,
    "account" : Account,
    "company" ? : Company
}){
    let {sign, timestamp, account} = params;

    let key = md5(JSON.stringify({
        timestamp,
        sign
    }));
    await cache.write(key, {
        accountId: account.id
    }, SESSIONTIME);

    return key;
}

export async function getTicket(key: string){
    let result = await cache.read(key);

    if(!result){
        return null;
    }

    //续期
    await cache.write(key, result, SESSIONTIME);
    return result;
}

export async function updateSession(key, session){
    let result = await cache.read(key);

    if(!result){
        return null;
    }

    result = session;
    
    await cache.write(key, result, SESSIONTIME);
    return result;
}


/* 返回一个默认公司 */
export async function getCompany( accountId : string, companyId? : string | undefined ) : Promise<Company>{
    let accountCompanies = await Models.accountCompany.find({
        where : {
            accountId
        }
    });

    let targetCompanyId;
    if(companyId){
        accountCompanies.map((item)=>{
            if(item.companyId == companyId){
                targetCompanyId = companyId;
            }
        });
    }else{
        if(accountCompanies.length){
            targetCompanyId = accountCompanies[0].companyId;
        }
    }

    if(!targetCompanyId){
        return null;
    }

    return await Models.company.get(targetCompanyId);
}

/* 检查公司是否属于 account */
let superUser = config.superUser;
export async function checkCompany(accountId: string, companyId?:string):Promise<boolean>{
    if(!companyId){
        return true;
    }

    //一般情况，session包含company
    let accountCompany = await Models.accountCompany.find({
        where : {
            accountId,
            companyId
        }
    });

    if(accountCompany.length > 1){
        console.error(`accountCompany, accountId: ${accountId}, companyId : ${companyId} 查出多条记录`);
    }
    return accountCompany.length > 0;
}