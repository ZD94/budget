/**
 * Created by wlh on 2017/3/13.
 */


'use strict';
const API = require("@jingli/dnode-api");
import LRU = require("lru-cache");
import L from '@jingli/language';
import { restfulAPIUtil } from 'api/restful';
import {CoordDispose, Degree} from "../libs/place/placeUtil";
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
}

export class CityService {

    static async getCity(id) :Promise<ICity> {
        let city = <ICity>cache.get(id)
        if  (city) {
            return city;
        }

        // city = await API.place.getCityInfo({cityCode: id});

        let result: any = await restfulAPIUtil.proxyHttp({
            uri: `/city/${id}`,
            method: 'GET'
        });
        if(result.code == 0){
            city = result.data;
        }
        if (city) {
            cache.set(id, city);
        }
        return city;
    }

    static async findCities(options) :Promise<any> {
        let result: any = await restfulAPIUtil.proxyHttp({ uri: `/city`, method: 'GET', qs: options });
        console.info("result===llllldddd", result);
        if(result.code == 0){
            return result.data;
        }
        return null;
    }

    /**
     * 根据城市id向上获取有火车站或机场的城市信息
     * @param params
     * @returns {Promise<any | any | any>}
     */
    static async getSuperiorCityInfo(params) :Promise<ICity>  {
        let self = this;
        let cityId = params.cityId;
        if (!cityId) {
            throw L.ERR.ERROR_CODE_C(500, "城市不存在");
        }
        let city = await this.getCity(cityId);

        if (!city) {
            throw L.ERR.ERROR_CODE_C(500, "城市不存在");
        }
        if(city.fcode == "AIRP" || city.fcode == "RSTN"){
            let parentCity = await this.getCity(city.parentId);
            return parentCity;
        }

        let child_cities = await this.findCities({
            where: {parentId: city.id, fcode: ["AIRP", "RSTN"]}});

        if(child_cities && child_cities.length){
            return city;
        }

        let deg = new Degree(parseFloat(city.latitude+""), parseFloat(city.longitude+""));
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
            }});


        nearbyStations = nearbyStations.filter((item: any)=>{
            return item.countryCode == city.countryCode;
        })

        if(nearbyStations && nearbyStations.length){
            orderByDistance(deg, nearbyStations);
            let parentCity = await this.getCity(nearbyStations[0].parentId);
            return parentCity;
        }

        let returnResult = await self.getSuperiorCityInfo({cityId: city.parentId});
        return returnResult;
    }

}

function orderByDistance(deg: Degree, nearbyStations: any){
    nearbyStations.forEach((item) => {
        let degItem = new Degree(parseFloat(item.latitude+""), parseFloat(item.longitude+""));
        let distance = CoordDispose.GetDistanceGoogle(deg, degItem);
        item.distance = distance;
    })
    nearbyStations.sort( (item1, item2) => {
        return item1.distance - item2.distance;
    });
}