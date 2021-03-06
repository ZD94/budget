/**
 * Created by mr_squirrel on 14/09/2017.
 */
'use strict';

import L from "@jingli/language";
import { Models } from '_types';
import { Company } from '_types/company';
import { Account } from '_types/account';
import md5 = require("md5");
const companyCols = Company['$fieldnames'];
import { CompanyType } from 'api/auth';

export interface CreateCompanyParams {
    companyId: string;
    name: string;
    priceLimitType?: number;
    appointedPubilcSuppliers: any;
    mobile: string;
    password: string;
}

export class CompanyModule {

    public async create(params: CreateCompanyParams) {
        let id = params.companyId;
        let { mobile } = params;
        if (!id || typeof (id) == 'undefined') {
            throw new L.ERROR_CODE_C(500, '缺少必要参数');
        }
        let checkCompany = await Models.company.get(id);
        if (checkCompany) {
            throw new L.ERROR_CODE_C(403, '企业已经存在');
        }

        let company = Company.create({
            id
        });
        mobile = await getUniqAccount(mobile);
        let account = Account.create({
            mobile: mobile, pwd: params.password,
            companyId: id
        })
        for (let key in params) {
            if (companyCols.indexOf(key) >= 0) {
                company[key] = params[key];
            }
        }
        const appId = md5(id);
        company.type = CompanyType.GENERAL;
        company.appId = appId;
        company.appSecret = appId.slice(-8);
        await account.save();
        company = await company.save();
        return company;
    }
}

const getUniqAccount = async (mobile: string) => {
    let usrs = await Models.account.find({
        where: {
            mobile
        }
    });
    if (usrs[0]) {
        return getUniqAccount(mobile += '0');
    }
    return mobile;
}

export default new CompanyModule();