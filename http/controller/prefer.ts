/**
 * Created by hexisen on 2017/8/30.
 */

'use strict';

import {AbstractModelController, Restful, Router} from "@jingli/restful";
import API from '@jingli/dnode-api';
import {Models} from "_types/index";
import {PreferRegion} from "_types/preferRegion";
import {Request, Response} from "express-serve-static-core";
@Restful()
export class PreferController extends AbstractModelController<PreferRegion> {
    constructor() {
        super(Models.preferRegion, PreferRegion["$fieldnames"]);
    }

    //companyId验证在更上一层
    async $before(req: Request, res: Response, next: Function){
        const {companyId} = req.session;
        let {id} = req.params;
        if(!id){
            return next();
        }

        let prefer = await Models.preferRegion.get(id);
        let companyRegion = await Models.companyRegion.get(prefer.id);
        if(companyRegion.companyId == companyId){
            next();
        }else{
            res.json(this.reply(403, null));
        }
    }

    /*async get(req, res, next){
        let {companyId, id} = req.params;
        let prefer = await Models.prefer.get(id);

        if(!prefer){
            return res.json(this.reply(0, null));
        }
        let check = await this.identCheck(prefer, companyId);
        return check ? res.json(this.reply(0, prefer)) : res.json(403, null);
    }*/

    /*async find(req, res, next) {
        res.json(this.reply(404, null));
    }*/

    // async update(req, res, next){
    //     let {id, companyId} = req.params;
    //     let params = req.body;
    //     let prefer = await Models.prefer.get(id);
    //     if(!prefer){
    //         return res.json(this.reply(0, null));
    //     }
    //     let check:boolean = await this.identCheck(prefer, companyId);
    //     if(!check){
    //         return res.json(this.reply(403, null));
    //     }

    //     /*if(typeof params.budgetConfig == "string"){
    //         params.budgetConfig = JSON.parse(params.budgetConfig);
    //     }*/

    //     for(let k in params){
    //         if(fildnames.indexOf(k)>-1){
    //             prefer[k] = params[k];
    //         }
    //     }
    //     prefer = await prefer.save();
    //     res.json(this.reply(0, prefer));
    // }

    /*async add(req, res, next){
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
    }*/

    // async delete(req, res, next){
    //     let {id, companyId} = req.params;
    //     let prefer = await Models.prefer.get(id);
    //     if(!prefer){
    //         return res.json(this.reply(404, null));
    //     }
    //     let check:boolean = await this.identCheck(prefer, companyId);
    //     if(!check){
    //         return res.json(this.reply(403, null));
    //     }

    //     await prefer.destroy();
    //     res.json(this.reply(0, prefer));
    // }
}