/**
 * Created by wlh on 2017/8/28.
 */

'use strict';
import {Restful, Router} from "../decorator";

@Restful()
export class TestController {

    async get(req, res, next) {
        res.send("get test");
    }

    @Router('/test')
    async test(req, res, next) {
        res.send("test");
    }
}