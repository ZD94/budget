/**
 * Created by hexisen on 2017/8/30.
 */

'use strict';

import {AbstractModelController, Restful, Router} from "@jingli/restful";
import API from '@jingli/dnode-api';
import {Models} from "_types/index";
import {PreferRegion} from "_types/preferRegion";
import {IRequest, IResponse} from "../index";
@Restful()
export class PreferController extends AbstractModelController<PreferRegion> {
    constructor() {
        super(Models.preferRegion, PreferRegion["$fieldnames"]);
    }

    //companyId验证在更上一层
    // async $before(req: IRequest, res: IResponse, next: Function){
    //     const {companyId} = req.session;
    //     let {id} = req.params;
    //     if(!id){
    //         return next();
    //     }

    //     let prefer = await Models.preferRegion.get(id);
    //     let companyRegion = await Models.companyRegion.get(prefer.id);
    //     if(companyRegion.companyId == companyId){
    //         next();
    //     }else{
    //         res.jlReply(this.reply(403, null));
    //     }
    // }

    async get(req, res, next){
        let {companyId, id} = req.params;
        let prefer = await Models.preferRegion.get(id);
        return prefer ? res.jlReply(this.reply(0, prefer)) : res.jlReply(403, null);
    }

    async find(req, res, next) {
        res.jlReply(this.reply(404, null));
    }

    async update(req, res, next){
        let self = this;
        let params = req.body;
        let prefer = await Models.preferRegion.get(id);
        if(!prefer){
            return res.jlReply(this.reply(0, null));
        }

        if(typeof params.budgetConfig == "string"){
            params.budgetConfig = JSON.parse(params.budgetConfig);
        }

        for(let k in params){
            if(PreferRegion["$fieldnames"].indexOf(k) > -1){
                prefer[k] = params[k];
            }
        }
        prefer = await prefer.save();
        res.jlReply(this.reply(0, prefer));
    }

    async add(req, res, next){
        let params = req.body;
        let prefer = PreferRegion.create({});
        if(typeof params.budgetConfig == "string"){
            params.budgetConfig = JSON.parse(params.budgetConfig);
        }
        
        for(let k in params){
            prefer[k] = params[k];
        }
        try{
            prefer = await prefer.save();
        } catch(err) {
            return res.jlReply(this.reply(500, null));
        }
     
        res.jlReply(this.reply(0, prefer));
    }

    async delete(req, res, next){
        let {id, companyId} = req.params;
        let prefer = await Models.preferRegion.get(id);
        if(!prefer){
            return res.jlReply(this.reply(404, null));
        }

        await prefer.destroy();
        res.jlReply(this.reply(0, prefer));
    }
}