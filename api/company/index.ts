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

export default class CompanyModule {

    public static async create(params: CreateCompanyParams) {
        let id = params.companyId;
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
        let account = Account.create({
            id, mobile: params.mobile, pwd: params.password
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