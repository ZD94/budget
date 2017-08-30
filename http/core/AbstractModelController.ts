/**
 * Created by wlh on 2017/8/29.
 */

'use strict';
import {AbstractController} from "./AbstractController";

export abstract class AbstractModelController extends AbstractController {

    constructor(private model: any, private property: any) {
        super();
    }

    async get(req, res, next) {
        let {id} = req.params;
        let instance = await this.model.get(id);
        res.json(this.reply(0, instance));
    }

    async find(req, res, next) {
        let params = req.query;
        console.info(params, "params============");
        let {p, pz, order} = params;
        pz = pz || 20;
        p = p || 0;
        let query = {where:{}};
        for(let key in params){
            if(this.property.indexOf(key) >= 0){
                query.where[key] = params[key];
            }
        }
        let offset = p * pz;
        let options: {
            [index: string]: any;
        } = {
            limit: pz,
            offset: offset
        }
        if (order) {
            options.order = order;
        }else{
            options.order = [["createdAt", "desc"]];
        }
        if(!options.limit)
            options.limit = pz;

        let pager = await this.model.find({where: query.where}, options);
        // res.json(pager);
        res.json(this.reply(0, pager));
    }

    async update(req, res, next) {
        let params = req.body;
        let id = req.params.id;
        if(!id) {
            res.json(this.reply(0, null));
        }
        let obj = await this.model.get(id);

        for(let key in params){
            if(this.property.indexOf(key) >= 0){
                obj[key] = params[key];
            }
        }
        obj = await obj.save();
        res.json(this.reply(0, obj));
    }


    async add(req, res, next) {
        let params = req.body;
        console.info(params, "params==============");
        let properties = {};
        for(let key in params){
            if(this.property.indexOf(key) >= 0){
                properties[key] = params[key];
            }
        }
        let obj = this.model.create(properties);
        obj = await obj.save();
        res.json(this.reply(0, obj));
    }

    async delete(req, res, next) {
        let params = req.params;
        let id = params.id;
        console.info(id, "id============");
        if(!id) {
            res.json(this.reply(0, null));
        }
        console.info(this.model);
        let obj = await this.model.get(id);
        console.info(obj, "obj===============");
        if(obj){
            let isDeleted = await obj.destroy();
            res.json(this.reply(0, isDeleted));
        }else{
            res.json(this.reply(0, null));
        }
    }
}