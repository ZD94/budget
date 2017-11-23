/**
 * Created by wlh on 2017/8/29.
 */

'use strict';
import { AbstractController, Restful, Router } from "@jingli/restful";
import { restfulAPIUtil } from 'api/restful';
import * as validator from 'validator';
<<<<<<< HEAD
import {Request, Response} from "express-serve-static-core";
var API = require("@jingli/dnode-api");
=======
import { autoSignReply } from 'http/reply';
import * as _ from 'lodash/fp';
>>>>>>> 90d97f7956692e00c3d292fe00cb2affcc125c9d

@Restful()
export class PlaceController extends AbstractController {
    constructor() {
        super();
    }

    $isValidId(id: string) {
<<<<<<< HEAD
        return /^(CTW?_\d+)|Global$/.test(id);
    }

    async get(req: Request, res: Response, next: Function) {
        let {id} = req.params;
        let city = await API['place'].getCityInfo({cityCode: id});
        city = this.transform(city);
        res.json(this.reply(0, city));

        //     let { id } = req.params;
        //     const resp: any = await restfulAPIUtil.proxyHttp({
        //         uri: `/city/${id}`,
        //         method: 'GET'
        //     })
        //
        //
        //     if (resp.code === 0) {
        //         return res.send(this.reply(0, this.transform(resp.data)))
        //     }
        //     return res.send(resp.code, null);
=======
        return /^\d+$/.test(id) || /^CTW?_\d+$/.test(id);
    }


    async get(req, res, next) {
        let { id } = req.params;
        const resp: any = await restfulAPIUtil.proxyHttp({
            uri: `/city/${id}`,
            method: 'GET'
        })

        if (resp.code === 0) {
            return res.jlReply(this.reply(0, this.transform(resp.data)))
        }
        return res.jlReply(resp.code, null);
    }
>>>>>>> 90d97f7956692e00c3d292fe00cb2affcc125c9d


<<<<<<< HEAD
    }

    // @Router('/search/:keyword', 'get')   ------- 此行不需要， queryHotCity, queryCity 两个即可使用该接口
    async find(req: Request, res: Response, next: Function) {
        let {keyword} = req.query;
        let cities = [];
        if (!keyword) {
            cities = await API['place'].queryHotCity({limit: 20});
        } else {
            cities = await API['place'].queryCity({keyword: keyword});
=======
        return res.jlReply(this.reply(resp.code, resp.data && resp.data.map(this.transform)));
    }

    @Router('/nearby/:longitude/:latitude', 'get')
    async findNearCity(req, res, next) {
        let { latitude, longitude } = req.params,
            pattern = /^\d+\.?\d+$/;

        const isValid = pattern.test(latitude) && pattern.test(longitude);
        if (!isValid) {
            return res.jlReply(this.reply(400, null));
>>>>>>> 90d97f7956692e00c3d292fe00cb2affcc125c9d
        }
        cities = cities.map((city) => {
            return this.transform(city);
        });
        res.json(this.reply(0, cities));


        //     let { keyword } = req.params;
        //     const resp: any = keyword
        //         ? await restfulAPIUtil.proxyHttp({ uri: `/city/search`, method: 'GET', qs: { keyword } })
        //         : await restfulAPIUtil.proxyHttp({ uri: `/city`, method: 'GET' })
        //
        //     return res.send(this.processResp(resp));
    }

    @Router('/nearby/:latitude/:longitude', 'get')
    async findNearCity(req: Request, res: Response, next: Function) {
        let {latitude,longitude} = req.query;
        const isValid = latitude === void 0
            || validator.isEmpty(latitude)
            || longitude === void 0
            || validator.isEmpty(longitude);
        if(!isValid){
            return
        }

<<<<<<< HEAD
        //     let { latitude, longitude } = req.params,
        //         pattern = /^\d+\.?\d+$/;
        //
        //     const isValid = pattern.test(latitude) && pattern.test(longitude);
        //     if (!isValid) {
        //         return res.send(this.reply(400, null));
        //     }
        //     const resp: any = await restfulAPIUtil.proxyHttp({
        //         uri: `/city/nearby/${longitude},${latitude}`,
        //         method: 'GET'
        //     });
        //
        //     return res.send(this.processResp(resp));
=======
        return res.jlReply(this.reply(resp.code, resp.data && resp.data.map(this.transform)));
>>>>>>> 90d97f7956692e00c3d292fe00cb2affcc125c9d
    }

    @Router('/:id/children', 'get')
    async getChildren(req: Request, res: Response, next: Function) {
        let {id} = req.params,
            cities = await API['place'].queryCity({parentId:id});
        res.json(this.reply(0,cities.map(this.transform)));

        //     let { id } = req.params;
        //     const resp: any = await restfulAPIUtil.proxyHttp({
        //         uri: `/city/${id}/children`,
        //         method: 'GET'
        //     });
        //
        //     return res.send(this.processResp(resp));
    }


    @Router('/getCitiesByLetter', 'GET')
    async getCitiesByLetter(req: Request, res: Response, next: Function){
        let {isAbroad = false, letter = 'A', limit = 20, page = 0, type} = req.params;
        let cities = await API['place'].getCitiesByLetter({
            isAbroad,
            letter,
            limit,
            page,
            type
        });
        res.json(this.reply(0,cities.map(this.transform)));
    }

    @Router('/getCitiesByLetter', 'GET')
    async getCityInfoByName(req, res, next){
        let {name} = req.params;
        let city = await API['place'].getCityInfoByName(name);
        res.json(this.reply(0, this.transform(city)));
    }

<<<<<<< HEAD
    // @Router('/queryHotCity', 'GET')
    // async queryHotCity(req, res, next){
    //     let params= req.params;
    //     let cities = await API['place'].queryHotCity(params);
    //     res.json(this.reply(0, cities.map(this.transform)));
    // }

    @Router('/getAirPortsByCity', 'GET')
    async getAirPortsByCity(req: Request, res: Response, next: Function){
        let {cityCode} = req.params;
        let airports = await API['place'].getAirPortsByCity({
            cityCode
        });
        res.json(this.reply(0, airports.map(this.transform)));
    }

    // @Router('/queryCity', 'GET')
    // async queryCity(req, res, next){
    //     let params = req.params;
    //     let cities = await API['place'].queryCity(params);
    //     res.json(this.reply(0, cities.map(this.transform)));
    // }

    private processResp(resp) {
        return resp.code === 0
            ? this.reply(0, resp.data.map(this.transform))
            : this.reply(resp.code, null);
=======
        return res.jlReply(this.reply(resp.code, resp.data && resp.data.map(this.transform)));
>>>>>>> 90d97f7956692e00c3d292fe00cb2affcc125c9d
    }

    private transform(city) {
        return {
            id: city.id,
            name: city.name,
            pinyin: city.pinyin,
            letter: city.letter,
            // latitude: city.lat,
            // longitude: city.lng,
            latitude: city.latitude,
            longitude: city.longitude,
            parentId: city.parentId,

            timezone: city.timezone,
            isAbroad: city.isAbroad,
            ctripCode:city.ctrip_code

        }
    }
}