/**
 * Created by wlh on 2017/8/29.
 */

'use strict';
import {Restful, Router} from "../core/decorator";
import API from '@jingli/dnode-api';
import {AbstractController} from "../core/AbstractController";

@Restful()
export class CityController extends AbstractController {
    constructor() {
        super();
    }

    $isValidId(id: string) {
        return /^CTW?_\d+$/.test(id);
    }

    async get(req, res, next) {
        let {id} = req.params;
        let city = await API.place.getCityInfo({cityCode: id});
        res.json(this.reply(0, city));
    }

    @Router('/test')
    async test(req, res, next) {
        res.send("ok")
    }
}