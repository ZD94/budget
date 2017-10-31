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
        return /^CTW?_\d+$/.test(id);
    }

    async get(req, res, next) {
        let {id} = req.params;
        let city = await API['place'].getCityInfo({cityCode: id});
        city = this.transform(city);
        res.json(this.reply(0, city));
    }

    async find(req, res, next) {
        let {keyword} = req.query;
        let cities = [];
        if (!keyword) {
            cities = await API['place'].queryHotCity({limit: 20});
        } else {
            cities = await API['place'].queryCity({keyword: keyword});
        }
        cities = cities.map( (city) => {
            return this.transform(city);
        });
        res.json(this.reply(0, cities));
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