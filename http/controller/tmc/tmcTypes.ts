/*
 * @Author: Mr.He 
 * @Date: 2017-12-28 16:42:20 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2017-12-28 21:01:02
 * @content what is the content of this file. */

import { tmcTypesMethod } from "model/tmc";


import { AbstractController, Restful, Router, reply, ReplyData } from "@jingli/restful";
import { jlReply } from 'http/index';

@Restful()
export default class TmcTypesController extends AbstractController {
    constructor() {
        super();
    }

    $isValidId(id: string) {
        return true;
    }

    async find(req, res, next) {
        let result = await tmcTypesMethod.getAllTmcTypes();
        res.jlReply(reply(0, result));
    }
}