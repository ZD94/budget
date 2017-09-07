/**
 * Created by mr_squirrel on 29/08/2017.
 */

'use strict'
import {AbstractController, Restful} from '@jingli/restful';
import API from '@jingli/dnode-api';
import {Models} from '_types';
import {Supplier} from '_types/supplier';
var supplierCols = Supplier['$fieldnames'];

//
@Restful('/company/:companyId/supplier')
export class SupplierController extends AbstractController {

    constructor() {
        super();
    }

    $isValidId(id: string) {
        return /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(id);
    }

    /*
     * 创建供应商
     */
    async add(req, res, next) {
        let params = req.body;
        let properties = {};
        for (let key in params) {
            if (supplierCols.indexOf(key) >= 0) {
                properties[key] = params[key];
            }
        }
        let obj = Supplier.create(properties);
        obj = await obj.save();
        res.json(this.reply(0, obj));
    }

    /*
     * 删除供应商
     */
    async delete(req, res, next) {
        let params = req.params;
        let id = params.id;
        if (!id || typeof(id) == 'undefined') {
            res.json(0, null);
        }
        let obj = await Models.supplier.get(id);
        let isDeleted = await obj.destroy();
        res.json(this.reply(0, isDeleted));
    }

    /*
     * 更新供应商
     */
    async update(req, res, next) {
        let params = req.body;
        let id = params.id;
        if (!id || typeof(id) == 'undefined') {
            res.json(this.reply(0, null));
        }
        let obj = await Models.supplier.get(id);
        for (let key in params) {
            if (supplierCols.indexOf(key) >= 0) {
                obj[key] = params[key];
            }
        }
        obj = await obj.save();
        res.json(this.reply(0, obj));
    }

    /*
     * 根据id查询供应商
     */
    async get(req, res, next) {
        let params = req.params;
        let id = params.id;
        if (!id || typeof (id) == 'undefined') {
            res.json(this.reply(0, null));
        }
        let obj = await Models.supplier.get(id);
        if (obj == undefined) {
            obj = null;
        }
        res.json(this.reply(0, obj));
    }

    /*
     * 根据属性名等查询供应商
     */
    async find(req, res, next) {
        let params = req.query;
        console.info(1111, params);

        if(params.companyId == 'null'){
            params.companyId = null;
        }

        let query = {where: {}};
        let limit = 20;
        for (let key in params) {
            if (supplierCols.indexOf(key) >= 0) {
                query.where[key] = params[key];
            }
        }
        if (!query['order'] || query['order'] == undefined) {
            query['order'] = [['createdAt', 'desc']];
        }
        if (!query['limit'] || query['limit'] == undefined) {
            query['limit'] = limit;
        }

        let obj = await Models.supplier.all(query);
        console.info(query);
        console.info(obj.length);
        if (obj == undefined) {
            obj = null;
        }
        res.json(this.reply(0, obj));
    }


}