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

    static async getCity(id) :Promise<ICity> {
        let city = <ICity>cache.get(id)
        if  (city) {
            return city;
        }
        let result = await request({
            uri: config.placeAPI + "/city/" + id,
            method: "get",
            json: true
        });

        if(result.code != 0){
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
}

/* setTimeout(async ()=>{
    let result = await API.place.getCityInfo({ cityCode: "CT_289" });
    console.log(result);



    let two = await CityService.getCity("1796231");
    console.log(two);
}, 5000); */