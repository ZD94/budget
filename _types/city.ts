/**
 * Created by wlh on 2017/3/13.
 */

'use strict';
const API = require("@jingli/dnode-api");
import LRU = require("lru-cache");
var cache = LRU(50);

export interface ICity {
    name: string;
    id: string;
    isAbroad: boolean;
    letter: string;
    code?: string;  //三字码
    longitude?: number;
    latitude?: number;
}


export class CityService {

    static async getCity(id) :Promise<ICity> {
        let city = <ICity>cache.get(id)
        if  (city) {
            return city;
        }
        city = await API.place.getCityInfo({cityCode: id});
        if (city) {
            cache.set(id, city);
        }
        return city;
    }
}