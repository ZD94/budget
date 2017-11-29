/**
 * Created by wlh on 2017/8/29.
 */

'use strict';
import { AbstractController, Restful, Router } from "@jingli/restful";
import { restfulAPIUtil } from 'api/restful';
import * as validator from 'validator';
import { autoSignReply } from 'http/reply';
import * as _ from 'lodash/fp';

@Restful()
export class PlaceController extends AbstractController {
    constructor() {
        super();
    }

    $isValidId(id: string) {
        return /^\d+$/.test(id) || /^CTW?_\d+$/.test(id);
    }


    async get(req, res, next) {
        let { id } = req.params;
        console.log("====>get: ", req.params)
        const resp: any = await restfulAPIUtil.proxyHttp({
            uri: `/city/${id}`,
            method: 'GET'
        })
        console.log("====>get: ", resp.data)
        if (resp.code === 0) {
            return res.jlReply(this.reply(0, this.transform(resp.data)))
        }
    
        return res.jlReply(resp.code, null);
    }

    @Router('/search/:keyword', 'get')
    async find(req, res, next) {
        let { keyword } = req.params;
        const resp: any = keyword
            ? await restfulAPIUtil.proxyHttp({ uri: `/city/search`, method: 'GET', qs: { keyword } })
            : await restfulAPIUtil.proxyHttp({ uri: `/city`, method: 'GET' })

        return res.jlReply(this.reply(resp.code, resp.data && resp.data.map(this.transform)));
    }

    @Router('/nearby/:longitude/:latitude', 'get')
    async findNearCity(req, res, next) {
        let { latitude, longitude } = req.params,
            pattern = /^\d+\.?\d+$/;

        const isValid = pattern.test(latitude) && pattern.test(longitude);
        if (!isValid) {
            return res.jlReply(this.reply(400, null));
        }
        const resp: any = await restfulAPIUtil.proxyHttp({
            uri: `/city/nearby/${longitude},${latitude}`,
            method: 'GET'
        });

        return res.jlReply(this.reply(resp.code, resp.data && resp.data.map(this.transform)));
    }

    @Router('/:id/children', 'get')
    async getChildren(req, res, next) {
        let { id } = req.params;
        const resp: any = await restfulAPIUtil.proxyHttp({
            uri: `/city/${id}/children`,
            method: 'GET'
        });

        return res.jlReply(this.reply(resp.code, resp.data && resp.data.map(this.transform)));
    }


    @Router('/getCitiesByLetter', 'GET')
    async getgetCitiesByLetter(req, res, next) {
        const resp: any = await restfulAPIUtil.proxyHttp({
            uri: `/city/getCitiesByLetter`,
            method: 'GET',
            qs: req.query
        });

        return res.jlReply(this.reply(resp.code, resp.data && resp.data.map(this.transform)))
    }

    @Router('/getCityInfoByName', 'GET')
    async getCityInfoByName(req, res, next) {
        const { name } = req.query;
        const resp: any = await restfulAPIUtil.proxyHttp({
            uri: `/city/getCityByName`,
            method: 'GET',
            qs: { name }
        });

        if (resp.code === 0) {
            return res.jlReply(this.reply(0, this.transform(resp.data)))
        }
        return res.jlReply(resp.code, null);
    }


    private transform(city) {
        return {
            id: city.id,
            name: city.name,
            pinyin: city.pinyin,
            letter: city.letter,
            latitude: city.lat,
            longitude: city.lng,
            parentId: city.parentId,
            isAbroad: city.isAbroad
        }
    }
}