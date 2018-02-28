/*
 * @Author: Mr.He
 * @Date: 2017-12-28 21:04:36
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-02-07 15:00:42
 * @content what is the content of this file. */

import {Models} from "_types";
import uuid = require("uuid");
import {TmcServiceType, TmcSupplier, TMCStatus, TmcSupplierService} from "_types/tmcSupplier";
import {where} from "sequelize";
import {obj} from "through2";
import {type} from 'os';


export class TmcSupplierMethod {
    async addSupplier(params: {
        companyId: string;
        tmcTypeId: string;
        type: number;
        name: string;
        identify: any;
        status: TMCStatus
    }, companyId, tmcTypeId): Promise<TmcSupplier> {
        //加入companyID 的检查
        let company = await Models.company.get(companyId);
        let tmcType = await Models.tmcTypes.get(params.tmcTypeId);
        if (!company || !tmcType) {
            throw new Error("公司或供应商不存在")
        }
        let isCmpany = await Models.tmcSupplier.all({
            where: {
                company_id: companyId,
                tmc_type_id: tmcTypeId,
                type: params.type,
            }
        });
        if (isCmpany && isCmpany.length != 0) {
            throw new Error("服务已开通，请勿重复添加")
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
        return await Models.tmcSupplier.all({
            where: {
                company_id: companyId
            }
        });
    }

    async getSuppliers(companyId: string): Promise<any> {
        console.log(companyId, "<=================companyId")
        let allSuppliers = await Models.tmcSupplier.all({
            where: {
                company_id: companyId
            }
        })
        console.log(allSuppliers, "<==========================allSuppliers")
        return allSuppliers
    }

    async updateSupplier(params, companyId, id): Promise<any> {
        let tmcSupplier = await Models.tmcSupplier.get(id);
        if (!tmcSupplier) {
            throw new Error("供应商不存在")
        }
        let paramsArr = Object.keys(params)
        let tmcSupplierArr = Object.keys(tmcSupplier.target.dataValues)

        for (let item of tmcSupplierArr) {
            if (paramsArr.indexOf(item) >= 0) {
                tmcSupplier[`${item}`] = params[`${item}`]
                continue
            }
        }
        for(let item of tmcSupplierArr){
            if (item == "identify") {
                for (let val in tmcSupplier[`${item}`]) {
                    let tmcSuppliers = tmcSupplier.toJSON()
                    tmcSuppliers["identify"][`${val}`] = params[`${val}`]
                    // console.log(val,"<============val")
                    // console.log(tmcSuppliers["identify"][`${val}`],"<=============tmcSuppliers[`${val}`]")
                    // console.log(tmcSupplier["identify"],"<=============1111111")
                }
            }
        }

        if (tmcSupplier.companyId == companyId) {
            console.log(tmcSupplier.target.dataValues,"<=============tmcSupplier[`${val}`]")
            return await tmcSupplier.save()
        } else {
            return "供应商与公司不匹配"
        }
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
            return "供应商不存在"
        }
        status = Number(status);
        if (tmcSupplier["0"]) {
            for (let item of tmcSupplier["0"].target.dataValues.services) {
                if (item.type == type) {
                    item.status = status
                }
            }
        }
        return await tmcSupplier[0].save();
    }

    async getTmcTypes(params): Promise<any> {
        let {companyId, sname} = params;
        let data;
        if (sname) {
            try {
                let tmcType = await Models.tmcTypes.find({
                    where: {
                        sname: sname
                    }
                });
                if (!tmcType["0"]) return "供应商不存在";
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
                    throw new Error("供应商未开通")
                }
                return data

            } catch (e) {
                console.log(e)
            }
        } else {
            try {
                let tmcSupplier = await Models.tmcSupplier.all({
                    where: {
                        company_id: companyId,
                    }
                });
                if (!tmcSupplier || tmcSupplier.length == 0) {
                    return "供应商不存在"
                }
                let newTmcSupplier = tmcSupplier.map(async function (item) {
                    let supplier = item.toJSON();
                    let tmcType = await Models.tmcTypes.get(supplier["tmcTypeId"]);
                    supplier["tmcName"] = tmcType.tmcName;
                    supplier["sname"] = tmcType.sname;
                    return supplier;
                });
                let data = await Promise.all(newTmcSupplier);
                return data
            } catch (e) {
                console.log(e)

            }
        }
    }
}

export let tmcSupplierMethod = new TmcSupplierMethod();