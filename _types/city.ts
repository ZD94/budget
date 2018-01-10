/**
 * Created by wlh on 2017/3/13.
 */

'use strict';
const API = require("@jingli/dnode-api");
import request = require("request-promise");
const config = require("@jingli/config");
import LRU = require("lru-cache");
var cache = LRU(50);

export interface ICity {
    name: string;
    id: string;
    isAbroad: boolean;
    letter: string;
    timezone: string;
    parentId: string;
    longitude: number;
    latitude: number;
    countryCode: string;
    location: { lat: number, lng: number };
    // code?: string;  //三字码
}


export class CityService {

    static async getCity(id): Promise<ICity> {
        let city = <ICity>cache.get(id)
        if (city) {
            return city;
        }

        if (id == "Global") {
            return null;
        }

        let uri = config.placeAPI + "/city/" + id;
        let result;
        try {
            result = await request({
                uri,
                method: "get",
                json: true
            });
        } catch (e) {
            console.error("place 服务获取地点失败 : ", uri);
            return null;
        }


        if (result.code != 0) {
            throw new Error("place服务地点不存在 : " + id);
        }
        city = result.data;
        city.isAbroad = !(city.countryCode == "CN");

        // city = await API.place.getCityInfo({ cityCode: id });
        if (city) {
            cache.set(id, city);
        }
        return city;
    }

    /* 转换新版placeId 为老版本 */
    static async getTransferCity(id: string): Promise<string> {
        let CT_reg = /CT/ig;
        let D_reg = /^\d+$/ig;

        if (CT_reg.test(id)) {
            return id;
        } else if (D_reg.test(id)) {
            //进入处理逻辑
        } else {
            return id;
        }

        let result = cache.get(id);
        if (result) {
            return result as string;
        }

        try {
            let getRequest = await request({
                uri: config.placeAPI + "/city/" + id + "/alternate/jlcityid",
                method: "get",
                json: true
            });
            if (getRequest.code == 0) {
                cache.set(id, getRequest.data.value);
                return getRequest.data.value;
            } else {
                return id;
            }
        } catch (e) {
            return id;
        }
    }
}

/* setTimeout(async () => {
    let result = await API.place.getCityInfo({ cityCode: "Global" });
    console.log(result);



    let two = await CityService.getCity("CT_289");
    console.log(two);
}, 7000); */