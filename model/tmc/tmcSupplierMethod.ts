/*
 * @Author: Mr.He
 * @Date: 2017-12-28 21:04:36
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-02-07 15:00:42
 * @content what is the content of this file. */

import {Models} from "_types";
import uuid = require("uuid");
import {TmcServiceType, TmcSupplier, TMCStatus, TmcSupplierService} from "_types/tmcSupplier";
import L from '@jingli/language';



export class TmcSupplierMethod {
    async addSupplier(params: {
        companyId: string;
        tmcTypeId: string;
        type: TmcServiceType;
        name: string;
        identify: any;
        status: TMCStatus
    }, companyId, tmcTypeId): Promise<TmcSupplier> {
        //加入companyID 的检查
        let company = await Models.company.get(companyId);
        let tmcType = await Models.tmcTypes.get(params.tmcTypeId);
        if (!company || !tmcType) {
            throw L.ERR.ERROR_CODE_C(500,"公司或供应商不存在")
        }
        let companies = await Models.tmcSupplier.all({
            where: {
                company_id: companyId,
                tmc_type_id: tmcTypeId,
                type: params.type,
            }
        });
        if (companies && companies.length != 0) {
            throw L.ERR.ERROR_CODE_C(500,"服务已开通，请勿重复添加")
        }
        let tmcSupplier = Models.tmcSupplier.create({
            id: uuid.v1(),
            type: params.type,
            identify: params.identify,
            name: params.name,
            status: params.status,
        });
        tmcSupplier.company = company;
        tmcSupplier.tmcType = tmcType;
        return await tmcSupplier.save();
    }

    async getSupplier(id: string) {
        return await Models.tmcSupplier.get(id);
    }

    async getAllSuppliers(companyId: string): Promise<any> {
        return  Models.tmcSupplier.all({
            where: {
                company_id: companyId
            }
        });
    }

    async updateSupplier(params, companyId, id): Promise<any> {
        let tmcSupplier = await Models.tmcSupplier.get(id);
        if (!tmcSupplier) {
            throw L.ERR.ERROR_CODE_C(500,"供应商不存在")
        }
        let paramsArr = Object.keys(params);
        let tmcSupplierArr = Object.keys(tmcSupplier.target.dataValues);
        for (let item of tmcSupplierArr) {
            if (paramsArr.indexOf(item) >= 0) {
                tmcSupplier[`${item}`] = params[`${item}`];
            }
        }
        if (tmcSupplier.companyId == companyId) {
            return tmcSupplier.save();
        }
        throw L.ERR.ERROR_CODE_C(500,"供应商与公司不匹配")

    }

    async changeState(params, body): Promise<any> {
        let {companyId, id} = params;
        let {status, type} = body;
        let tmcSupplier = await Models.tmcSupplier.find({
            where: {
                company_id: companyId,
                tmc_type_id: id
            }
        });
        if (!tmcSupplier) {
            throw L.ERR.ERROR_CODE_C(500,"供应商不存在")
        }
        status = Number(status);
        if (tmcSupplier["0"]) {
            tmcSupplier["0"].target.dataValues.status = status
        }
        return await tmcSupplier[0].save();
    }

    async getTmcTypes(params): Promise<any> {
        let {companyId, sname} = params;
        let data;
        if (sname) {
                let tmcType = await Models.tmcTypes.find({
                    where: {
                        sname: sname
                    }
                });
                if (!tmcType["0"]) throw L.ERR.ERROR_CODE_C(500,"供应商不存在");
                let tmcSupplier = await Models.tmcSupplier.all({
                    where: {
                        company_id: companyId,
                        tmc_type_id: tmcType["0"]["id"]
                    }
                });
                if (tmcSupplier && tmcSupplier.length != 0) {
                    let newTmcSupplier = tmcSupplier.map(async function (item) {
                        let supplier = item.toJSON();
                        supplier["tmcName"] = tmcType["0"]["tmcName"];
                        supplier["sname"] = tmcType["0"]["sname"];
                        return supplier;
                    });
                    data = await Promise.all(newTmcSupplier);
                } else {
                    throw L.ERR.ERROR_CODE_C(500,"供应商未开通")
                }
                return data
        }

        let tmcSupplier = await Models.tmcSupplier.all({
            where: {
                company_id: companyId,
            }
        });
        if (!tmcSupplier || tmcSupplier.length == 0) {
            throw L.ERR.ERROR_CODE_C(500,"供应商不存在")
        }
        let newTmcSupplier = tmcSupplier.map(async function (item) {
            let supplier = item.toJSON();
            let tmcType = await Models.tmcTypes.get(supplier["tmcTypeId"]);
            supplier["tmcName"] = tmcType.tmcName;
            supplier["sname"] = tmcType.sname;
            return supplier;
        });
            data = await Promise.all(newTmcSupplier);
        return data
    }
}

export let tmcSupplierMethod = new TmcSupplierMethod();