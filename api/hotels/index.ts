/**
 * Created by wlh on 2017/6/9.
 */

'use strict';

import API from "@jingli/dnode-api";
import {AbstractDataSupport} from "../data-support";
import {TASK_NAME} from "../types";
import {IHotel} from "../../_types/budget";
import Config = require("@jingli/config")
let redis = require("redis");
let redis_client = null;

let Hotel_IS_USE_CACHE = true;
let Cache_Duration = 10*60;

function get_redis(){
    if(!redis_client){
        redis_client = redis.createClient(Config.redis);
        redis_client.on('error', function(err){

        });
    }
    return redis_client;
}
export interface ISearchHotelParams {
    checkInDate: string;
    checkOutDate: string;
    city: string;
    latitude?: number;
    longitude?: number;
}

export class HotelSupport extends AbstractDataSupport<IHotel> {

    async search_hotels(params: ISearchHotelParams) {
        let {city, latitude, longitude, checkInDate, checkOutDate} = params;
        let cityObj = await API['place'].getCityInfo({cityCode: city});
        if (!latitude || !longitude) {
            params.latitude = cityObj.latitude;
            params.longitude = cityObj.longitude;
        }

        let result: IHotel[] = [];
        let client = get_redis();
        let key = `hotel:${city}-${checkInDate}:${checkOutDate}:${latitude}:${longitude}`;
        if(Hotel_IS_USE_CACHE){
            try {
                result = JSON.parse(client.getAsync(key));
            } catch(err){}
        }
        if(result && result.length) return result;


        if (!cityObj.isAbroad) {
            result = await this.getData(TASK_NAME.HOTEL, params);
        }
        if(cityObj.isAbroad) {
            result = await this.getData(TASK_NAME.HOTEL_ABROAD, params);
        }

        if(result && result.length){
            if(Hotel_IS_USE_CACHE) {
                await client.setAsync(key, JSON.stringify(result), 'ex', Cache_Duration);
            }
        }

        return result;
    }
}

var hotelSupport = new HotelSupport();
export default hotelSupport;