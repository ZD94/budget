/*
 * @Author: Mr.He 
 * @Date: 2017-12-28 21:04:36 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2017-12-29 10:52:09
 * @content what is the content of this file. */

import { Models } from "_types";
import uuid = require("uuid");
import { TmcServiceType, TmcSupplier } from "_types/tmcSupplier";

export class TmcSupplierMethod {
    async addSupplier(params: {
        companyId: string;
        tmcTypeId: string;
        services: TmcServiceType[];
        name: string;
        identify: any;
    }, companyId): Promise<TmcSupplier> {

        console.log("addSupplier====>", params);
        //加入companyID 的检查
        let company = await Models.company.get(companyId);
        let tmcType = await Models.tmcTypes.get(params.tmcTypeId);
        let tmcSupplier = Models.tmcSupplier.create({
            id: uuid.v1(),
            services: params.services,
            identify: params.identify,
            name: params.name
        });

        tmcSupplier.company = company;
        tmcSupplier.tmcType = tmcType;

        return await tmcSupplier.save();
    }

    async getSupplier(id: string) {
        return await Models.tmcSupplier.get(id);
    }

    async getAllSuppliers(companyId: string): Promise<any> {
        // console.log(123, companyId);
        return await Models.tmcSupplier.all({
            where: {
                company_id: companyId
            }
        });
    }
}

export let tmcSupplierMethod = new TmcSupplierMethod();