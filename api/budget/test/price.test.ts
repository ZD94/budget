/**
 * Created by ycl on 2017/9/26.
 */

'use strict';

var assert = require("assert");
var API = require("@jingli/dnode-api");
// import moment = require("moment");
// import Logger from "@jingli/logger";
// const logger = new Logger("mocha");
// import {pricePrefer} from "./prefer/price";


import {loadPrefers} from "../prefer";
var defaultCompanyPrefer = require("../prefer/default-prefer/default-company-prefer.json");
var sysPrefer = require("../prefer/default-prefer/sys-prefer.json");
var PricePrefer = require("../prefer/price");
var hotelData = require("./hotel.json");

import { DEFAULT_PREFER_CONFIG_TYPE} from "../prefer"

var hotel_levels = [2,3,4,5];


describe('Hotel Scoring', async function (){
    describe('Domestic Hotel Price',async function () {

        let checkInDate = '2017-08-01';
        let checkOutDate = '2017-08-02';
        let location = {
            latitude: 39.929986,
            longitude: 116.395645
        }

        for(let i = 0; i < hotel_levels.length; i++) {
            let qs = {local: {
                checkInDate,
                checkOutDate,
                star: hotel_levels[i],
                latitude: location.latitude,
                longitude: location.longitude,
            }};
            it(`result when hotelStar equals ${hotel_levels[i]}`, async function(){
                let allPrefers = loadPrefers([], qs, DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_HOTEL);
                let pricePreferConfig:any = {};
                for(let j = 0; j < allPrefers.length; j++){
                    if(allPrefers[j].name == 'price') {
                        pricePreferConfig = allPrefers[j];
                    }
                }
                if(typeof(pricePreferConfig) == 'string') {
                    pricePreferConfig = JSON.parse(pricePreferConfig);
                }
                let pricePrefer = new PricePrefer(pricePreferConfig.name, pricePreferConfig.options);


                if(typeof(hotelData) == 'string') hotelData = JSON.parse(hotelData)

                let result = await pricePrefer.markScoreProcess(hotelData);
                result = result.sort(function(item1, item2){
                    if(item1.score > item2.score){
                        return -1;
                    } else if(item1.score <= item2.score){
                        return 1;
                    }
                });
                assert.equal(result[0].name, '北京乾元酒店');
                assert.ok(true)

            })
        }

    });


    it('Abroad Hotel Price', function () {
        describe('Domestic Hotel Price',async function () {

            let checkInDate = '2017-08-01';
            let checkOutDate = '2017-08-02';
            let location = {
                latitude: 39.929986,
                longitude: 116.395645
            }

            for(let i = 0; i < hotel_levels.length; i++) {
                let qs = {local: {
                    checkInDate,
                    checkOutDate,
                    star: hotel_levels[i],
                    latitude: location.latitude,
                    longitude: location.longitude,
                }};
                it(`result when hotelStar equals ${hotel_levels[i]}`, async function(){
                    let allPrefers = loadPrefers([], qs, DEFAULT_PREFER_CONFIG_TYPE.ABROAD_HOTEL);
                    let pricePreferConfig:any = {};
                    for(let j = 0; j < allPrefers.length; j++){
                        if(allPrefers[j].name == 'price') {
                            pricePreferConfig = allPrefers[j];
                        }
                    }
                    if(typeof(pricePreferConfig) == 'string') {
                        pricePreferConfig = JSON.parse(pricePreferConfig);
                    }
                    let pricePrefer = new PricePrefer(pricePreferConfig.name, pricePreferConfig.options);


                    if(typeof(hotelData) == 'string') hotelData = JSON.parse(hotelData)

                    let result = await pricePrefer.markScoreProcess(hotelData);
                    result = result.sort(function(item1, item2){
                        if(item1.score > item2.score){
                            return -1;
                        } else if(item1.score <= item2.score){
                            return 1;
                        }
                    });
                    assert.equal(result[0].name, '北京乾元酒店');
                    assert.ok(true)

                })
            }

        });
    });

})