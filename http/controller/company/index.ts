/**
 * Created by hxs on 2017/9/7.
 */


'use strict';

import {AbstractModelController, Restful, Router} from "@jingli/restful";
import {Models} from "_types";
import {Company} from "_types/company";
<<<<<<< HEAD
=======
import { CompanyType } from 'api/auth'
import { autoSignReply } from 'http/reply';
>>>>>>> 90d97f7956692e00c3d292fe00cb2affcc125c9d
const md5 = require('md5');

/** 
 * company的权限由接口自己控制 
 */

var companyCols = Company['$fieldnames'];

@Restful()
export class CompanyController extends AbstractModelController<Company>{

    constructor() {
        super(Models.company, companyCols);
    }

    $isValidId(id: string) {
        return /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(id);
    }

    @Router('/', 'get')
    async getById(req, res, next) {
        let {companyId} = req.session;
        let result = await Models.company.get(companyId);
        res.jlReply(this.reply(0, result || null));
    }

    @Router('/byAccount', 'get')
    async find(req, res, next) {
        let {accountId} = req.session;
        let {order = [["createdAt", "desc"]], p = 0, pz = 20} = req.query;

        let authorizations = await Models.authorization.find({
            where:{
                agent:accountId
            },
            limit: pz,
            offset: pz * p,
            order
        });

        let companies = await Promise.all(authorizations.map(async (item)=>{
            return await Models.company.get(item.companyId);
        }));
        res.jlReply(this.reply(0, companies));
    }


    async update(req, res, next) {
        let {companyId} = req.session,
            params = req.body;

        let obj = await Models.company.get(companyId);

        for(let key in params){
            if(companyCols.indexOf(key) >= 0){
                obj[key] = params[key];
            }
        }
        obj = await obj.save();
        res.jlReply(this.reply(0, obj));
    }

    // TODO:

    async add(req, res, next){
        let params = req.body;
        let {id} = params;
        if(!id || typeof(id) == 'undefined') {
            return res.jlReply(this.reply(502, null));
        }
        let checkCompany = await Models.company.get(id);
        if(checkCompany){
            return res.jlReply(this.reply(403, null));
        }

        let company = Company.create({
            id
        });
        for(let key in params){
            if(companyCols.indexOf(key) >= 0){
                company[key] = params[key];
            }
        }
        const appId = md5(id);
        company.type = CompanyType.GENERAL;
        company.appId = appId;
        company.appSecret = appId.slice(-8);
        company = await company.save();
        res.jlReply(this.reply(0, company));
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
    //         return res.jlReply(this.reply(404, null));
    //     }

    //     let session = req.session;
    //     session.company = company;
    //     let ticket = req.headers['ticket'] || req.query.ticket; 
    //     let result = await updateSession(ticket, session);
    //     if(!result){
    //         return res.jlReply(this.reply(500, null));
    //     }

    //     res.jlReply(this.reply(0, company));
    // }
}
