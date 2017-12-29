/*
 * @Author: Mr.He 
 * @Date: 2017-12-28 16:42:16 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2017-12-29 10:51:46
 * @content what is the content of this file. */

import { tmcSupplierMethod } from "model/tmc";


import { AbstractController, Restful, Router, reply, ReplyData } from "@jingli/restful";
import { jlReply } from 'http/index';

@Restful()
export default class TmcSupplierController extends AbstractController {
    constructor() {
        super();
    }

    $isValidId(id: string) {
        return /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(id);
    }

    @Router("/:companyId/:id", "get")
    async getOne(req, res, next) {
        console.log(1111111, req.params);
        //need check the companyId is ok.
        let tmcSupplier = await tmcSupplierMethod.getSupplier(req.params.id);
        res.jlReply(reply(0, tmcSupplier));
    }

    @Router("/:companyId/", "get")
    async findAll(req, res, next) {
        let tmcSuppliers = await tmcSupplierMethod.getAllSuppliers(req.params.companyId);
        res.jlReply(reply(0, tmcSuppliers));
    }

    @Router("/:companyId/", "post")
    async addOne(req, res, next) {
        let result = await tmcSupplierMethod.addSupplier(req.body, req.params.companyId);
        res.jlReply(reply(0, result));
    }

    async udpate(req, res, next) {

    }

    // async delete(req, res, next){

    // }
}