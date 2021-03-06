/**
 * Created by wlh on 16/8/15.
 */

'use strict';
import {IFinalHotel} from "./interface";
import {AbstractPrefer} from "./AbstractPrefer";

const BLACKLIST_HOTEL_AGENTS = ['hotels.com', '好订'];

class BlackListPrefer extends AbstractPrefer<IFinalHotel> {

    private score:number;

    constructor(name, options) {
        super(name, options);
        if (!this.score) {
            this.score = 0;
        }
    }

    async markScoreProcess(hotels: IFinalHotel[]) : Promise<IFinalHotel[]> {
        let self = this;
        hotels = hotels.map( (hotel) => {
            if (!hotel.score) hotel.score = 0;

            if (!hotel.reasons) hotel.reasons = [];

            if (BLACKLIST_HOTEL_AGENTS.indexOf(hotel.agent) >= 0) {
                hotel.score += self.score;
                hotel.reasons.push(`供应商黑名单, ${hotel.agent} +${self.score}`);
            } else {
                hotel.reasons.push(`不在供应商黑名单 0`)
            }
            return hotel;
        })
        return hotels;
    }
}

export= BlackListPrefer;