/**
 * Created by hxs on 2017/9/7.
 */


'use strict';

import {AbstractModelController, Restful, Router} from "@jingli/restful";
import {Models} from "_types";
import {Company} from "_types/company";
import {updateSession, getCompany} from "api/auth";

/** 
 * company的权限由接口自己控制 
 */

var companyCols = Company['$fieldnames'];

@Restful()
export class CompanyController extends AbstractModelController{

    constructor() {
        super(Models.company, companyCols);
    }

    $isValidId(id: string) {
        return /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(id);
    }


    async get(req, res, next) {

        let companyId = req.params.id;
        if(!companyId || typeof companyId == 'undefined') {
            return res.json(this.reply(502, null));
        }

        //查询公司权限
        let {accountId} = req.session;
        let accountCompany = await Models.accountCompany.find({
            where : {
                accountId,
                companyId
            }
        });

        if(!accountCompany.length){
            return res.json(this.reply(403, null));
        }

        let result = await Models.company.get(companyId);
        if(result == undefined) result = null;
        res.json(this.reply(0, result));
    }

    async find(req, res, next) {
        let {accountId} = req.session;
        let {order, p, pz} = req.query;
        pz = pz || 20;
        p  = p  || 0;
        order = order || [["createdAt", "desc"]];

        let accountCompanies = await Models.accountCompany.find({
            where : {
                accountId
            },
            limit : pz,
            offset: pz * p,
            order
        });

        let companies = await Promise.all(accountCompanies.map(async (item)=>{
            return await Models.company.get(item.companyId);
        }));        
        res.json(this.reply(0, companies));
    }


    async update(req, res, next) {
        let params = req.body;
        let id = params.id;
        if(!id || typeof(id) == 'undefined') {
            return res.json(this.reply(0, null));
        }
        let obj = await Models.company.get(id);

        for(let key in params){
            if(companyCols.indexOf(key) >= 0){
                obj[key] = params[key];
            }
        }
        obj = await obj.save();
        res.json(this.reply(0, obj));
    }

    /*
     * body { companyId }
    */
    // @Router("/bindcompany", "post")
    // async other(req, res, next){
    //     let {accountId} = req.session;
    //     let {companyId} = req.body;
    //     let company = await getCompany(accountId, companyId);

    //     if(!company){
    //         return res.json(this.reply(404, null));
    //     }

    //     let session = req.session;
    //     session.company = company;
    //     let ticket = req.headers['ticket'] || req.query.ticket; 
    //     let result = await updateSession(ticket, session);
    //     if(!result){
    //         return res.json(this.reply(500, null));
    //     }

    //     res.json(this.reply(0, company));
    // }
}
