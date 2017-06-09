/**
 * Created by wlh on 2017/6/9.
 */

'use strict';

import API from "@jingli/dnode-api";
import {AbstractDataSupport} from "../data-support";
import {TASK_NAME} from "../types";

export interface IHotel {}
export class HotelSupport extends AbstractDataSupport<IHotel> {

    async search_hotels(params) {
        let hotels = await this.getData(TASK_NAME.HOTEL, params);
        let abroadHotels = await this.getData(TASK_NAME.HOTEL_ABROAD, params);
        return [...hotels, ...abroadHotels];
    }
}

var hotelSupport = new HotelSupport();
export default hotelSupport;