/**
 * Created by mr_squirrel on 29/08/2017.
 */

'use strict'
import {AbstractController, Restful, Router} from '@jingli/restful';
import API from '@jingli/dnode-api';
import {Models} from '_types';
import {Supplier} from '_types/supplier';
import { autoSignReply } from 'http/reply';
var BookLink = require ('api/supplier/index');
var supplierCols = Supplier['$fieldnames'];



//
@Restful()
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
        res.jlReply(this.reply(0, obj));
    }

    /*
     * 删除供应商
     */
    
    async delete(req, res, next) {
        let params = req.params;
        let id = params.id;
        if (!id || typeof(id) == 'undefined') {
            res.jlReply(0, null);
        }
        let obj = await Models.supplier.get(id);
        let isDeleted = await obj.destroy();
        res.jlReply(this.reply(0, isDeleted));
    }

    /*
     * 更新供应商
     */
    
    async update(req, res, next) {
        let params = req.body;
        let id = params.id;
        if (!id || typeof(id) == 'undefined') {
            res.jlReply(this.reply(0, null));
        }
        let obj = await Models.supplier.get(id);
        if (obj.companyId !== null) { //更新私有供应商
            for (let key in params) {
                if (supplierCols.indexOf(key) >= 0) {
                    obj[key] = params[key];
                }
            }
            // console.log('updateobj', obj);
            obj = await obj.save();
            res.jlReply(this.reply(0, obj));
        }
        if (obj.companyId == null) { //更新公共供应商
            let objCom = await Models.company.get(req.session.companyId);
            let objAppArr = [];
            // console.log(req.params.companyId);
            console.log('objCom', objCom);
            console.log('objApp', objCom.appointedPubilcSuppliers);
            objAppArr = objAppArr.concat(objCom.appointedPubilcSuppliers);
            if (params.isAdd) {  // add

                objAppArr.push(params.id);
                console.log('add', objAppArr);
            }
            else {  //delete
                let i = objAppArr.indexOf(params.id);
                console.log('del', objCom['appointedPubilcSuppliers']);
                objAppArr.splice(i, 1);
            }
            console.log('beforesave', objAppArr);
            objCom.appointedPubilcSuppliers = objAppArr;
            objCom = await objCom.save();
            res.jlReply(this.reply(0, objCom));
        }
    }

    /*
     * 根据id查询供应商
     */
    
    async get(req, res, next) {
        let params = req.params;
        console.info('getparams', params);
        let id = params.id;
        if (!id || typeof (id) == 'undefined') {
            res.jlReply(this.reply(0, null));
        }
        let obj = await Models.supplier.get(id);
        // console.info('getobj', obj);
        if (obj == undefined) {
            obj = null;
        }
        res.jlReply(this.reply(0, obj));
    }

    /*
     * 根据属性名等查询供应商
     */
    
    async find(req, res, next) {
        let params = req.query;
        if (params.companyId == 'null' || params.companyId == '') {
            params.companyId = null;
        }
        const {companyId} = req.session;


        let query = {where: {companyId}};
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
        // console.info('findobj', obj);
        console.info(obj.length);
        if (obj == undefined) {
            obj = null;
        }
        res.jlReply(this.reply(0, obj));
    }

    @Router("/getBookLink", 'POST')
    async other(req, res, next){
        let params = req.body;
        console.log('params', params);
        let obj = await BookLink.getBookLink(params);
        console.log('params', params);
        console.log('obj', obj);
        if (obj == undefined) {
            obj = null;
        }
        res.jlReply(this.reply(0, obj));
    }
}