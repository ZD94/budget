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

    @autoSignReply()
    async get(req, res, next) {
        let { id } = req.params;
        const resp: any = await restfulAPIUtil.proxyHttp({
            uri: `/city/${id}`,
            method: 'GET'
        })

        if (resp.code === 0) {
            return res.send(this.reply(0, this.transform(resp.data)))
        }
        return res.send(resp.code, null);
    }
    @Router('/search/:keyword', 'get')
    @autoSignReply()
    async find(req, res, next) {
        let { keyword } = req.params;
        const resp: any = keyword
            ? await restfulAPIUtil.proxyHttp({ uri: `/city/search`, method: 'GET', qs: { keyword } })
            : await restfulAPIUtil.proxyHttp({ uri: `/city`, method: 'GET' })

        return res.send(this.reply(resp.code, resp.data && resp.data.map(this.transform)));
    }

    @Router('/nearby/:longitude/:latitude', 'get')
    @autoSignReply()
    async findNearCity(req, res, next) {
        let { latitude, longitude } = req.params,
            pattern = /^\d+\.?\d+$/;

        const isValid = pattern.test(latitude) && pattern.test(longitude);
        if (!isValid) {
            return res.send(this.reply(400, null));
        }
        const resp: any = await restfulAPIUtil.proxyHttp({
            uri: `/city/nearby/${longitude},${latitude}`,
            method: 'GET'
        });

        return res.send(this.reply(resp.code, resp.data && resp.data.map(this.transform)));
    }

    @Router('/:id/children', 'get')
    @autoSignReply()
    async getChildren(req, res, next) {
        let { id } = req.params;
        const resp: any = await restfulAPIUtil.proxyHttp({
            uri: `/city/${id}/children`,
            method: 'GET'
        });

        return res.send(this.reply(resp.code, resp.data && resp.data.map(this.transform)));
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
        }
    }
}