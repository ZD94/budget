/**
 * Created by wlh on 2017/8/29.
 */

'use strict';
import { AbstractController, Restful, Router } from "@jingli/restful";
import { CityService } from "_types/city";
import { restfulAPIUtil } from 'api/restful';
import * as validator from 'validator';
var API = require("@jingli/dnode-api");

@Restful()
export class PlaceController extends AbstractController {
    constructor() {
        super();
    }

    $isValidId(id: string) {
        return /^(CTW?_\d+)|Global$/.test(id) || /^[0-9]+$/.test(id);
    }

    async get(req, res, next) {
        let { id } = req.params;
        const resp: any = await restfulAPIUtil.proxyHttp({
            uri: `/city/${id}`,
            method: 'GET'
        });

        if (resp.code === 0) {
            return res.send(this.reply(0, await this.transform(resp.data)))
        }
        return res.send(resp.code, null);
    }

    @Router('/search/(:keyword)?', 'get')
    async find(req, res, next) {
        let { keyword } = req.params;
        let cities = [];
        const resp: any = keyword
            ? await restfulAPIUtil.proxyHttp({ uri: `/city/search`, method: 'GET', qs: { keyword } })
            : await restfulAPIUtil.proxyHttp({ uri: `/city`, method: 'GET' })
        return res.send(this.processResp(resp));
    }

    @Router('/nearby/:latitude/:longitude', 'get')
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

        return res.send(this.processResp(resp.data));
    }

    @Router('/:id/children', 'get')
    async getChildren(req, res, next) {
        let { id } = req.params;
        const resp: any = await restfulAPIUtil.proxyHttp({
            uri: `/city/${id}/children`,
            method: 'GET'
        });
        return res.send(this.processResp(resp));
    }


    @Router('/getCitiesByLetter', 'GET')
    async getCitiesByLetter(req, res, next) {
        let { isAbroad = false, letter = 'A', limit = 20, page = 0, type = 2, lang = 'zh' } = req.query;

        let country_code = (isAbroad == true || isAbroad.toString() == 'true') ? '!CN' : 'CN';
        let qs = {
            letter,
            lang,
            country_code,
            limit,
            page,
        };
        const resp: any = await restfulAPIUtil.proxyHttp({
            uri: `/city/getCitiesByLetter`,
            method: 'GET',
            qs
        });
        res.json(this.reply(0, await this.processResp(resp)));
    }

    @Router('/getCityInfoByName', 'GET')
    async getCityInfoByName(req, res, next) {
        let { name } = req.query;
        if (!name) return res.json(this.reply(502, null));
        let resp: any
        try {
            resp = await restfulAPIUtil.proxyHttp({
                uri: `/city/getCityByName`,
                method: 'GET',
                qs: {
                    name
                }
            });
        } catch(e) {
            return res.json(this.reply(resp.code, null))
        }
        res.json(this.reply(0, await this.transform(resp.data)));
    }


    @Router('/getAirPortsByCity', 'GET')
    async getAirPortsByCity(req, res, next) {
        let { cityCode } = req.query;
        let airports = await API['place'].getAirPortsByCity({
            cityCode
        });
        let ps = airports.map((airport) => {
            return this.transform(airport);
        });
        res.json(this.reply(0, await Promise.all(ps)));
    }

    private async processResp(resp) {
        if (resp.code == 0) {
            let ps = resp.data.map((item) => {
                return this.transform(item);
            });
            return this.reply(0, await Promise.all(ps));
        }
        return this.reply(resp.code, null);
    }

    private async transform(city) {
        let res: any = await restfulAPIUtil.proxyHttp({ uri: `/city/${city.id}/alternate/iatacode` });
        let iataCode;
        if (!res.code || res.code == 200) {
            iataCode = res.data ? res.data.value : null;
        }

        return {
            id: city.id,
            name: city.name,
            pinyin: city.pinyin,
            letter: city.letter,
            latitude: city.latitude ? city.latitude : city.lat,
            longitude: city.longitude ? city.longitude : city.lng,
            parentId: city.parentId,
            timezone: city.timezone,
            isAbroad: city.country_code == 'CN' ? true : false,
            ctripCode: iataCode ? iataCode : city.ctrip_code
        }
    }
}
