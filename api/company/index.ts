/**
 * Created by mr_squirrel on 14/09/2017.
 */
'use strict';

import L from "@jingli/language";
import { Models } from '_types';
import { Company } from '_types/company';
import md5 = require("md5");
const companyCols = Company['$fieldnames'];
import { CompanyType } from 'api/auth';

export interface CreateCompanyParams {
    id: string;
    name: string;
    priceLimitType?: number;
    appointedPubilcSuppliers: any;
}

export default class CompanyModule {

    public async create(params: CreateCompanyParams) {
        let { id } = params;
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
        for (let key in params) {
            if (companyCols.indexOf(key) >= 0) {
                company[key] = params[key];
            }
        }
        const appId = md5(id);
        company.type = CompanyType.GENERAL;
        company.appId = appId;
        company.appSecret = appId.slice(-8);
        company = await company.save();
        return company;
    }
}