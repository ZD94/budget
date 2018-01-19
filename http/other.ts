/*
 * @Author: Mr.He 
 * @Date: 2018-01-17 17:49:23 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-01-17 19:05:19
 * @content what is the content of this file. */

import { budget } from "model/budget";
import { reply } from "@jingli/restful";
import { jlReply } from 'http/index';
import { clearTimeout } from 'timers';


export default function OtherHttp(router) {
    router.get("/budget/getBudgetItems", async (req, res, next) => {
        req.clearTimeout();
        let { key } = req.query;
        if (key != "Jingli2018") {
            return res.jlReply(reply(400, null));
        }

        let result = await budget.getBudgetItems(req.query);
        res.jlReply(reply(0, result));
    });
}