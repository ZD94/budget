/**
 * Created by hxs on 2017/9/7.
 */


'use strict';

import {AbstractModelController, Restful} from "@jingli/restful";
import {Models} from "_types";
import {Company} from "_types/company";

var companyCols = Company['$fieldnames'];

@Restful()
export class CompanyController extends AbstractModelController{

    constructor() {
        super(Models.subsidyType, companyCols);
    }

    $isValidId(id: string) {
        return /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(id);
    }

    async get(req, res, next) {
        let {id} = req.params;
        if(!id || typeof id == 'undefined') {
            return res.json(this.reply(502, null));
        }

        let result = await Models.company.get(id);
        if(result == undefined) result = null;
        res.json(this.reply(0, result));
    }


    /*async find(req, res, next) {

        let {accountId} = req.query;
        // let companies = await Models.accountCompany.find()
        

        res.json(this.reply(0, result));

        res.send("company/Info find");
    }*/




}


