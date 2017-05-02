/**
 * Created by wlh on 2017/3/13.
 */

'use strict';
const API = require("@jingli/dnode-api");

export interface ICity {
    name: string;
    id: string;
    isAbroad: boolean;
    letter: string;
    code?: string;  //三字码
    longitude?: number;
    latitude?: number;
}

let cityMap = new Map<string, ICity>();

export class CityService {

    static async getCity(id) :Promise<ICity> {
        let city = cityMap.get(id)
        if  (city) {
            return city;
        }
        city = await API.place.getCityInfo({cityCode: id});
        if (city) {
            cityMap.set(id, city);
        }
        return city;
    }
}