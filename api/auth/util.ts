let cache = require("common/cache");
let uuid = require("uuid");
let md5  = require("md5");
import L from "@jingli/language";
import { Models } from "_types";
import {Account} from "_types/account";
import {Company} from "_types/company";
/*
 * redis 记录 account, company
*/

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
        account
    }, 20 * 1000);

    return key;
}

export async function checkTicket(key: string){
    let result = await cache.read(key);

    if(!result){
        return null;
    }

    //续期
    await cache.write(key, result, 20 * 1000);
    return result;
}

export async function updateSession(key, session){
    let result = await cache.read(key);

    if(!result){
        return null;
    }

    result = session;
    
    await cache.write(key, result, 20 * 1000);
    return result;
}


/* 绑定公司 */
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
let supreUser = ["qmtrip@jingli365.com"];
export async function checkCompany(session:{
    account: Account,
    company:Company
}, companyId: string):Promise<boolean>{
    if(!companyId){
        return true;
    }

    let {account, company} = session;

    for(let item of supreUser){
        if(account.email == item || account.mobile == item){
            return true;
        }
    }

    return company.id == companyId;

    //一般情况，session包含company
    /* let accountCompanies = await Models.accountCompany.find({
        where : {
            accountId
        }
    });

    let result = false;
    accountCompanies.map((item)=>{
        if(item.companyId == companyId){
            result = true;
        }
    });
    return result; */
}