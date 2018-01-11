/**
 * Created by ycl on 2017/8/25.
 */
'use strict';

import {ReserveLink} from 'libs/suppliers/interface';
import {SupplierGetter} from 'libs/suppliers';
import { ICity, CityService } from '_types/city';

var API = require("@jingli/dnode-api");
let getSupplier: SupplierGetter;


export default class BookLink {
    static async getBookLink(options: {
        supplier: any, data?: any, reserveType: string, fromCity?:string, toCity?: string, leaveDate?:Date, backDate?:Date,
        city?: string, checkInDate?: Date, checkOutDate?: Date
    }): Promise<ReserveLink> {
        console.log('getBookLink starts');

        console.log(options);
        let supplierKey = options.supplier.supplierKey;
        let trafficBookLink = options.supplier.trafficBookLink;
        let hotelBookLink = options.supplier.hotelBookLink;
        let reserveType = options.reserveType;
        let defaultBackUrl = "";

        switch (reserveType){
            case "travel_plane":
            case "travel_train":
                defaultBackUrl = trafficBookLink;
                console.log('trafficBookLink', trafficBookLink);
                break;
            case "hotel":
                defaultBackUrl = hotelBookLink;
                console.log('hotelBookLink', hotelBookLink);
                break;
        }

        if(!supplierKey){
            return {url: defaultBackUrl, jsCode: ""};
        }

        if(options.fromCity) {
            console.info(options.fromCity);
            let cityObject = await CityService.getCity(options.fromCity);
            options.fromCity = cityObject.name;
        }
        if(options.toCity){
            console.info(options.toCity);
            let cityObject = await CityService.getCity(options.toCity);
            options.toCity = cityObject.name;
        }
        if(options.city){
            console.info(options.city);
            let cityObject = await CityService.getCity(options.city);
            options.city = cityObject.name;
        }

        if(!getSupplier){
            getSupplier = require('libs/suppliers').getSupplier;
        }

        
        let client = getSupplier(supplierKey);
        var bookLink = await client.getBookLink(options);
        console.log('bookLink', bookLink);


        if(!bookLink || !bookLink.url){
            return {url: defaultBackUrl, jsCode: ""};
        }

        return bookLink;
    }
}