/**
 * Created by hexisen on 2017/8/30.
 */

'use strict';

import {Restful, Router} from "../core/decorator";
import API from '@jingli/dnode-api';
import {Models} from "_types/index";
import {AbstractModelController} from "../core/AbstractModelController";
import {Prefer} from "_types/prefer";

@Restful()
export class PreferController extends AbstractModelController {
    constructor() {
        super(Models.prefer);
    }

    async find(req, res, next) {
        res.json(this.reply(404, null));
    }

    async identCheck(prefer:Prefer, companyId:string){
        let companyRegion = await Models.companyRegion.get(prefer.companyRegion.id);
        if(companyRegion.companyId != companyId){
            return false;
        }

        return true;
    }

    async update(req, res, next){
        let {id} = req.params;
        let params = req.body;
        let companyId = params.companyId;
        let prefer = await Models.prefer.get(id);
        if(!prefer){
            return res.json(this.reply(404, null));
        }
        let check:boolean = await this.identCheck(prefer, companyId);
        if(!check){
            return res.json(this.reply(403, null));
        }

        if(typeof params.budgetConfig == "string"){
            params.budgetConfig = JSON.parse(params.budgetConfig);
        }

        for(let k in params){
            prefer[k] = params[k];
        }
        prefer = await prefer.save();
        res.json(this.reply(0, prefer));
    }

    async add(req, res, next){
        let params = req.body;
        let prefer = Prefer.create({});
        if(typeof params.budgetConfig == "string"){
            params.budgetConfig = JSON.parse(params.budgetConfig);
        }

        for(let k in params){
            prefer[k] = params[k];
        }
        prefer = await prefer.save();
        res.json(this.reply(0, prefer));
    }

    async delete(req, res, next){
        let {id} = req.params;
        let companyId = req.body.companyId;
        let prefer = await Models.prefer.get(id);
        if(!prefer){
            return res.json(this.reply(404, null));
        }
        let check:boolean = await this.identCheck(prefer, companyId);
        if(!check){
            return res.json(this.reply(403, null));
        }

        await prefer.destroy();
        res.json(this.reply(0, prefer));
    }
}