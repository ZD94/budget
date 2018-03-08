/**
 * Created by wlh on 2018/3/8.
 */

'use strict';

export interface IFinalHotel {
    name: string;
    latitude: string;
    longitude: string;
    star: number;
    agent: string;
    price: number;
    bookUrl?: string;
    deeplinkData?: object;
    score?: number;
    reasons?: string[];
    checkInDate: string;
    checkOutDate: string;
    outPriceRange: boolean;
    commentScore?: number;
}
export enum EHotelStar {
    FIVE = 5,
    FOUR = 4,
    THREE = 3,
    TOW = 2,
}