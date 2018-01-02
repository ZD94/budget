/*
 * @Author: Mr.He 
 * @Date: 2017-12-28 21:04:36 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2017-12-29 10:52:09
 * @content what is the content of this file. */

import {Models} from "_types";
import uuid = require("uuid");
import {TmcServiceType, TmcSupplier,TMCStatus} from "_types/tmcSupplier";
import {where} from "sequelize";

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
        if (!company || !tmcType) {
            throw new Error("公司或供应商不存在")
        }
        let isCmpany = await await Models.tmcSupplier.all({
            where: {
                company_id: companyId,
                tmc_type_id: id
            }
        });
        if (isCmpany) {
            throw new Error("公司已存在，请勿重复添加")
        }
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
        return await Models.tmcSupplier.all({
            where: {
                company_id: companyId
            }
        });
    }

    async updateSupplier(params, companyId, id): Promise<any> {
        let tmcSupplier = await Models.tmcSupplier.get(id);
        if (!tmcSupplier) {
            throw new Error("供应商不存在")
        }
        for (let item in tmcSupplier.target.dataValues) {
            for (let items in params) {
                if (item == items) {
                    tmcSupplier.target.dataValues[`${item}`] = params[`${items}`]
                }
            }
        }

        if (tmcSupplier.target.dataValues.companyId == companyId) {
            return await tmcSupplier.save()
        } else {
            return "供应商与公司不匹配"
        }
    }

    async changeState(params, body): Promise<any> {
        let {companyId, id} = params;
        console.log(companyId,"<=============companyId",id)
        let {status } = body;
        let company = await await Models.tmcSupplier.find({
            where: {
                company_id: companyId,
                tmc_type_id: id
            }
        });
        status = Number(status);
        switch (status){
            case 1:
                status = "未开通";
                break;
            case 2:
                status = "测试中";
                break;
            case 3:
                status = "测试失败";
                break;
            case 4:
                status = "等待启用";
                break;
            case 5:
                status = "正常使用";
                break;
            case 6:
                status = "停用";
                break;
        }
        console.log("====>",company["0"],"<==============company");
        if (company["0"]) {
            console.log(status,"<==============status");
            company[0].status = status;
            console.log("====>", company["0"].target.dataValues.status, status, "<================公司")
            return await company[0].save();
        }
    }
}

export let tmcSupplierMethod = new TmcSupplierMethod();