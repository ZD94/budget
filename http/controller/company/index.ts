/**
 * Created by hxs on 2017/9/7.
 */

'use strict';

import {AbstractController, Restful} from "@jingli/restful";
import {Models} from "_types";


@Restful()
export class CompanyInfoController extends AbstractController{

    constructor() {
        super();
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

    async find(req, res, next) {

        let {accountId} = req.query;
        // let companies = await Models.accountCompany.find()
        

        res.json(this.reply(0, result));

        res.send("company/Info find");
    }



}


