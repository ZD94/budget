/**
 * Created by wlh on 2017/3/13.
 */


'use strict';
const API = require("@jingli/dnode-api");
import request = require("request-promise");
const config = require("@jingli/config");
import LRU = require("lru-cache");
import L from '@jingli/language';
import { restfulAPIUtil } from 'api/restful';
import { CoordDispose, Degree } from "../libs/place/placeUtil";
var cache = LRU(50);

export interface ICity {
    name: string;
    id: string;
    isAbroad: boolean;
    letter: string;
    timezone: string;
    longitude: number;
    latitude: number;
    code?: string;  //三字码
    parentId: string;
    pinyin: string;
    countryCode: string;
    fcode: string;
    ctripCode?: string;
}

export enum PlaceType {
    GTRAIN = 1,
    TRAIN = 2

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

        const alternate: any = await restfulAPIUtil.proxyHttp({
            uri: `/city/${id}/alternate`,
            method: 'GET'
        });
        for (let item of alternate.data) {
            if (item.lang == "ctripcode") {
                city.ctripCode = item.value;
                break;
            }
        }
        // city = await API.place.getCityInfo({ cityCode: id });
        if (city) {
            cache.set(id, city);
        }
        return city;
    }

    static async findCities(options): Promise<any> {
        let result: any = await restfulAPIUtil.proxyHttp({ uri: `/city`, method: 'GET', qs: options });
        if (result.code == 0) {
            return result.data;
        }
        return null;
    }

    /**
     * 根据城市id向上获取有火车站或机场的城市信息
     * @param params
     * @returns {Promise<any | any | any>}
     */
    static async getSuperiorCityInfo(params: { cityId: string }): Promise<ICity> {
        let self = this;
        let cityId = params.cityId;
        if (!cityId) {
            throw L.ERR.ERROR_CODE_C(500, "城市不存在");
        }
        let city = await this.getCity(cityId);

        if (!city) {
            throw L.ERR.ERROR_CODE_C(500, "城市不存在");
        }
        if (city.fcode == "AIRP" || city.fcode == "RSTN") {
            let parentCity = await this.getCity(city.parentId);
            return parentCity;
        }

        let child_cities = await this.findCities({
            where: { parentId: city.id, fcode: ["AIRP", "RSTN"] }
        });

        if (child_cities && child_cities.length) {
            return city;
        }

        let deg = new Degree(parseFloat(city.latitude + ""), parseFloat(city.longitude + ""));
        let result = CoordDispose.GetDegreeCoordinates(deg, 100);
        let nearbyStations: any[] = await this.findCities({
            where: {
                lat: {
                    $gte: result["lat_min"],
                    $lte: result["lat_max"]
                },
                lng: {
                    $gte: result["lng_min"],
                    $lte: result["lng_max"]
                },
                fcode: ["AIRP", "RSTN"]
            }
        });


        nearbyStations = nearbyStations.filter((item: any) => {
            if (item.fcode == "AIRP") {
                return item.countryCode == city.countryCode;
            } else {
                return item.countryCode == city.countryCode;
            }
        })

        if (nearbyStations && nearbyStations.length) {
            orderByDistance(deg, nearbyStations);
            let parentCity = await this.getCity(nearbyStations[0].parentId);
            return parentCity;
        }

        let returnResult = await self.getSuperiorCityInfo({ cityId: city.parentId });
        return returnResult;
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

function orderByDistance(deg: Degree, nearbyStations: any) {
    nearbyStations.forEach((item) => {
        let degItem = new Degree(parseFloat(item.latitude + ""), parseFloat(item.longitude + ""));
        let distance = CoordDispose.GetDistanceGoogle(deg, degItem);
        item.distance = distance;
    })
    nearbyStations.sort((item1, item2) => {
        return item1.distance - item2.distance;
    });
}

/* setTimeout(async () => {
    let result = await API.place.getCityInfo({ cityCode: "Global" });
    console.log(result);



    let two = await CityService.getCity("CT_289");
    console.log(two);
}, 7000); */
