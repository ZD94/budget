/*
 * @Author: Mr.He 
 * @Date: 2017-12-28 21:04:36 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2017-12-29 10:52:09
 * @content what is the content of this file. */

import {Models} from "_types";
import uuid = require("uuid");
import {TmcServiceType, TmcSupplier, TMCStatus, TmcSupplierService} from "_types/tmcSupplier";
import {where} from "sequelize";
import {obj} from "through2";

export class TmcSupplierMethod {
    async addSupplier(params: {
        companyId: string;
        tmcTypeId: string;
        services: TmcSupplierService[];
        name: string;
        identify: any;
    }, companyId, tmcTypeId): Promise<TmcSupplier> {
        //加入companyID 的检查
        let company = await Models.company.get(companyId);
        let tmcType = await Models.tmcTypes.get(params.tmcTypeId);
        if (!company || !tmcType) {
            throw new Error("公司或供应商不存在")
        }

        let isCmpany = await await Models.tmcSupplier.all({
            where: {
                company_id: companyId,
                tmc_type_id: tmcTypeId
            }
        });
        // if (isCmpany) {
        //     throw new Error("公司已存在，请勿重复添加")
        // }
        let obj;
        let arr = [];
        for (let item of params.services) {
            obj = {
                type: item,
                status: TMCStatus.TEST,
                time: new Date()
            };
            arr.push(obj)
        }
        params.services.splice(0, params.services.length);
        params.services.push(...arr);
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
        let arr = [];
        let obj = {};
        for (let item in tmcSupplier.target.dataValues) {
            for (let items in params) {
                if (item == items) {
                    if (item == "services") {
                        for (let val of params["services"]) {
                            obj = {
                                "time": tmcSupplier["services"][0].time,
                                "type": val.type,
                                "status": tmcSupplier["services"][0].status
                            };
                            arr.push(obj)
                        }
                        tmcSupplier["services"] = arr
                    } else {
                        tmcSupplier[`${item}`] = params[`${items}`]
                    }
                }
            }
        }

        if (tmcSupplier.companyId == companyId) {
            return await tmcSupplier.save()
        } else {
            return "供应商与公司不匹配"
        }
    }

    async changeState(params, body): Promise<any> {
        let {companyId, id} = params;
        let {status, type} = body;
        let tmcSupplier = await await Models.tmcSupplier.find({
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
        if (sname) {
            try {
                let tmcType = await Models.tmcTypes.find({
                    where: {
                        sname: sname
                    }
                });
                let tmcSupplier = await await Models.tmcSupplier.find({
                    where: {
                        company_id: companyId,
                        tmc_type_id: tmcType["0"]["id"]
                    }
                });
                tmcSupplier["0"]["target"]["dataValues"]["tmcName"] = tmcType["0"]["tmcName"];
                tmcSupplier["0"]["target"]["dataValues"]["sname"] = tmcType["0"]["sname"];
                return tmcSupplier
            } catch (e) {
                console.log(e)
            }
        }else {
            let tmcSupplier = await Models.tmcSupplier.all({
                where: {
                    company_id: companyId,
                }
            });
            if (!tmcSupplier) {
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
        }
    }
}

export let tmcSupplierMethod = new TmcSupplierMethod();
