/**
 * Created by wlh on 2017/6/9.
 */

'use strict';

import API from "@jingli/dnode-api";
import {AbstractDataSupport} from "../data-support";
import {TASK_NAME} from "../types";
import {IHotel} from "../../_types/budget";

export interface ISearchHotelParams {
    checkInDate: string;
    checkOutDate: string;
    city: string;
    latitude?: number;
    longitude?: number;
}

export class HotelSupport extends AbstractDataSupport<IHotel> {

    async search_hotels(params: ISearchHotelParams) {
        let {city, latitude, longitude} = params;
        let cityObj = await API['place'].getCityInfo({cityCode: city});
        if (!latitude || !longitude) {
            params.latitude = cityObj.latitude;
            params.longitude = cityObj.longitude;
        }
        if (!cityObj.isAbroad) {
            return this.getData(TASK_NAME.HOTEL, params);
        }
        return this.getData(TASK_NAME.HOTEL_ABROAD, params);
    }
}

var hotelSupport = new HotelSupport();
export default hotelSupport;