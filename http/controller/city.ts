/**
 * Created by wlh on 2017/8/29.
 */

'use strict';
import {AbstractController, Restful, Router} from "@jingli/restful";
import { restfulAPIUtil } from 'api/restful';
import * as validator from 'validator';

@Restful()
export class CityController extends AbstractController {
    constructor() {
        super();
    }

    $isValidId(id: string) {
        return /^\d+$/.test(id);
    }

    async get(req, res, next) {
        let {id} = req.params;
        const resp: any = await restfulAPIUtil.proxyHttp({
            url: `/city/${id}`,
            method: 'GET'
        })

        if(resp.code === 0) {
            return res.send(this.reply(0, this.transform2(resp.data)))
        }
        return res.send(resp.code, null);
    }

    async find(req, res, next) {
        let {keyword} = req.query;
        const resp: any = keyword
            ? await restfulAPIUtil.proxyHttp({url: `/city/search/`, method: 'GET'})
            : await restfulAPIUtil.proxyHttp({url: `/city`, method: 'GET'})
        const result = resp.code === 0
            ? this.reply(0, resp.data.map(this.transform2))
            : this.reply(resp.code, null);
        return res.send(result);
    }

    @Router('/nearby/:longitude/:latitude', 'get')
    async findNearCity(req, res, next) {
        let {latitude, longitude} = req.params,
            pattern = /^\d+\.?\d+$/;
            
        const isValid = pattern.test(latitude) && pattern.test(longitude);
        if(!isValid){
            return res.send(this.reply(400, null));
        }
        const resp: any = await restfulAPIUtil.proxyHttp({
            url: `/city/nearby/${longitude},${latitude}`,
            method: 'GET'
        });

        return res.send(this.processResp(resp));
    }

    @Router('/:id/children', 'get')
    async getChildren(req, res, next) {
        let {id} = req.params;
        const resp: any = await restfulAPIUtil.proxyHttp({
            url: `/city/${id}/children`,
            method: 'GET'
        });

        return res.send(this.processResp(resp));
    }

    private processResp(resp) {
        return resp.code === 0
            ? this.reply(0, resp.data.map(this.transform2))
            : this.reply(resp.code, null);
    }

    private transform2(city) {
        return {
            id: city.id,
            name: city.name,
            pinyin: city.pinyin,
            letter: city.letter,
            latitude: city.lat,
            longitude: city.lng,
            parentId: city.parentId,
        }
    }

    private transform(city) {
        return {
            id: city.id,
            name: city.name,
            pinyin: city.pinyin,
            letter: city.letter,
            latitude: city.latitude,
            longitude: city.longitude,
            parentId: city.parentId,
        }
    }
}