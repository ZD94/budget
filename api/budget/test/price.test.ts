/**
 * Created by ycl on 2017/9/26.
 */

'use strict';

var assert = require("assert");
var moment = require("moment");
var API = require("@jingli/dnode-api");
// import Logger from "@jingli/logger";
// const logger = new Logger("mocha");
import {
    TrafficBudgetStrategyFactory, HotelBudgetStrategyFactory
} from "../strategy/index";
import { DEFAULT_PREFER_CONFIG_TYPE} from "../prefer"
import {loadPrefers} from "../prefer";

export enum EHotelLevel {
    FIVE_STAR = 5,
    FOUR_STAR = 4,
    THREE_STAR = 3,
    TWO_STAR = 2
}

export enum ETrainLevel {
    // BUSINESS = 1,
    // FIRST_CLASS = 2,
    // SECOND_CLASS = 3,
    BUSINESS_SEAT = 1,
    FIRST_SEAT = 2,
    SECOND_SEAT = 3,
    PRINCIPAL_SEAT = 4,
    SENIOR_SOFT_SLEEPER = 5,
    SOFT_SLEEPER = 6,
    HARD_SLEEPER = 7,
    SOFT_SEAT = 8,
    HARD_SEAT = 9,
    NO_SEAT = 10,
}

export enum EPlaneLevel {
    // BUSINESS_FIRST = 1,
    ECONOMY = 2,
    FIRST = 3,
    BUSINESS = 4,
    PREMIUM_ECONOMY = 5,    //高端经济仓
}

var defaultCompanyPrefer = require("../prefer/default-prefer/default-company-prefer.json");
var sysPrefer = require("../prefer/default-prefer/sys-prefer.json");
var PricePrefer = require("../prefer/price");

var hotelDomestic = require("./data/hotel-domestic.json");
var hotelAbroad = require("./data/hotel-abroad.json");

var hotel_levels = [2,3,4,5];

var traffic = {
    plane: [2,3,4,5],
    train: [1,2,3,4,5,6,7,8,9,10]
}


describe('Hotel-Price-Scoring', async function (){
    describe('Domestic-Hotel-Price',async function () {
        let checkInDate = '2017-09-27';
        let checkOutDate = '2017-09-28';
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


                if(typeof(hotelDomestic) == 'string') hotelDomestic = JSON.parse(hotelDomestic)

                let result = await pricePrefer.markScoreProcess(hotelDomestic);
                result = result.sort(function(item1, item2){
                    if(item1.score > item2.score){
                        return -1;
                    } else if(item1.score <= item2.score){
                        return 1;
                    }
                });
                assert.equal(result[0].name, '北京乾元酒店');
            })
        }

    });

    describe('Abroad-Hotel-Price', function () {
        let checkInDate = '2017-09-28';
        let checkOutDate = '2017-09-30';
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


                if(typeof(hotelAbroad) == 'string') hotelAbroad = JSON.parse(hotelAbroad)

                let result = await pricePrefer.markScoreProcess(hotelAbroad);
                result = result.sort(function(item1, item2){
                    if(item1.score > item2.score){
                        return -1;
                    } else if(item1.score <= item2.score){
                        return 1;
                    }
                });
                console.log("result: ", result[0])
                assert.equal(result[0].name, '纽约第五大道朗汉广场酒店(Langham Place, New York, Fifth Avenue)');
            })
        }
    });

    describe('Domestic-Hotel-Price-As-Whole', function () {
        let result = ['汉庭（北京王府井大街店）', '北京河北迎宾馆',
            '北京古巷贰拾号艺术酒店', '北京VUE后海酒店']
        let cityId = 'CT_131';  //北京
        let checkInDate = '2017-09-27';
        let checkOutDate = '2017-09-28';
        let location = {
            latitude: 39.929986,
            longitude: 116.395645
        }
        for(let i =0; i < hotel_levels.length; i++) {
            let qs = {local: {
                checkInDate,
                checkOutDate,
                star: hotel_levels[i],
                latitude: location.latitude,
                longitude: location.longitude,
            }};
            it(`when hotelStar equals ${hotel_levels[i]}`, async function(){
                let allPrefers = loadPrefers([], qs, DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_HOTEL);
                let strategy = await HotelBudgetStrategyFactory.getStrategy({
                    star: hotel_levels[i],
                    checkInDate,
                    checkOutDate,
                    prefers: allPrefers,
                    city: cityId,
                    location,
                }, {isRecord: true});

                let isRetMarkedData = false;
                let budget = await strategy.getResult(hotelDomestic, isRetMarkedData, 'CNY');
                assert.equal(budget.name, result[i], [`星级${hotel_levels[i]}, 打分后结果：${result[i]}`])
            })
        }
        // describe('Domestic-Hotel-Price',async function () {
        //     let checkInDate = '2017-09-27';
        //     let checkOutDate = '2017-09-28';
        //     let location = {
        //         latitude: 39.929986,
        //         longitude: 116.395645
        //     }
        //
        //     for(let i = 0; i < hotel_levels.length; i++) {
        //         let qs = {local: {
        //             checkInDate,
        //             checkOutDate,
        //             star: hotel_levels[i],
        //             latitude: location.latitude,
        //             longitude: location.longitude,
        //         }};
        //         it(`result when hotelStar equals ${hotel_levels[i]}`, async function(){
        //             let allPrefers = loadPrefers([], qs, DEFAULT_PREFER_CONFIG_TYPE.ABROAD_HOTEL);
        //             let pricePreferConfig:any = {};
        //             for(let j = 0; j < allPrefers.length; j++){
        //                 if(allPrefers[j].name == 'price') {
        //                     pricePreferConfig = allPrefers[j];
        //                 }
        //             }
        //             if(typeof(pricePreferConfig) == 'string') {
        //                 pricePreferConfig = JSON.parse(pricePreferConfig);
        //             }
        //             let pricePrefer = new PricePrefer(pricePreferConfig.name, pricePreferConfig.options);
        //
        //
        //             if(typeof(hotelDomestic) == 'string') hotelDomestic = JSON.parse(hotelDomestic)
        //
        //             let result = await pricePrefer.markScoreProcess(hotelDomestic);
        //             result = result.sort(function(item1, item2){
        //                 if(item1.score > item2.score){
        //                     return -1;
        //                 } else if(item1.score <= item2.score){
        //                     return 1;
        //                 }
        //             });
        //             assert.equal(result[0].name, '北京乾元酒店');
        //             assert.ok(true)
        //
        //         })
        //     }
        //
        // });
    });

    describe('Abroad-Hotel-Price-As-Whole', function () {
        let result = ['纽约永兴酒店(Windsor Hotel New York)', '纽约智选假日酒店 - 时代广场店(Holiday Inn Express - Times Square New York)',
        '纽约曼哈顿金融区假日酒店(Holiday Inn Manhattan Financial District New York)', '纽约市布莱恩公园酒店(The Bryant Park Hotel New York City)']
        let cityId = 'CTW_301';  //纽约
        let checkInDate = '2017-09-28';
        let checkOutDate = '2017-09-30';
        let location = {
            latitude: 40.7127837,
            longitude: -74.0059413
        }


        for(let i =0; i < hotel_levels.length; i++) {

            let qs = {local: {
                checkInDate,
                checkOutDate,
                star: hotel_levels[i],
                latitude: location.latitude,
                longitude: location.longitude,
            }};
            it(`when hotelStar equals ${hotel_levels[i]}`, async function(){
                let allPrefers = loadPrefers([], qs, DEFAULT_PREFER_CONFIG_TYPE.ABROAD_HOTEL);
                let strategy = await HotelBudgetStrategyFactory.getStrategy({
                    star: hotel_levels[i],
                    checkInDate,
                    checkOutDate,
                    prefers: allPrefers,
                    city: cityId,
                    location,
                }, {isRecord: true});

                let isRetMarkedData = false;
                let budget = await strategy.getResult(hotelAbroad, isRetMarkedData, 'CNY');

                assert.equal(budget.name, result[i], [`星级${hotel_levels[i]}, 打分后结果：${result[i]}`])
                // it(`星级${hotel_levels[i]}, 打分后结果：${result[i]}`);
            })
        }
    });
})



describe('Traffic-Price-Scoring', async function (){
    describe('Domestic-Traffic-Price',async function () {
        let leaveDate = '2017-09-27';
        let originPlace = 'CT_131';
        let destination = 'CT_289';

        for(let i = 0; i < traffic.plane.length; i++) {
            for(let ii = 0; ii < traffic.train.length; i++) {
                let qs = {
                    local: {
                        expectTrainCabins: traffic.train[ii],
                        expectFlightCabins: traffic.plane[i],
                        leaveDate: leaveDate,
                        earliestLeaveDateTime: new Date(moment(`${leaveDate} 08:00`)),
                        latestArrivalDateTime: null,
                    }
                }
                it(`result when plane_cabin equals ${traffic.plane[i]} and train_seat equals ${traffic.train[ii]}`, async function(){
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


                    if(typeof(hotelDomestic) == 'string') hotelDomestic = JSON.parse(hotelDomestic)

                    let result = await pricePrefer.markScoreProcess(hotelDomestic);
                    result = result.sort(function(item1, item2){
                        if(item1.score > item2.score){
                            return -1;
                        } else if(item1.score <= item2.score){
                            return 1;
                        }
                    });
                    assert.equal(result[0].name, '北京乾元酒店');
                })
            }

        }

    });

    describe('Abroad-Traffic-Price', function () {
        let checkInDate = '2017-09-28';
        let checkOutDate = '2017-09-30';
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


                if(typeof(hotelAbroad) == 'string') hotelAbroad = JSON.parse(hotelAbroad)

                let result = await pricePrefer.markScoreProcess(hotelAbroad);
                result = result.sort(function(item1, item2){
                    if(item1.score > item2.score){
                        return -1;
                    } else if(item1.score <= item2.score){
                        return 1;
                    }
                });
                console.log("result: ", result[0])
                assert.equal(result[0].name, '纽约第五大道朗汉广场酒店(Langham Place, New York, Fifth Avenue)');
            })
        }
    });

    describe('Domestic-Traffic-Price-As-Whole', function () {
        let result = ['汉庭（北京王府井大街店）', '北京河北迎宾馆',
            '北京古巷贰拾号艺术酒店', '北京VUE后海酒店']
        let cityId = 'CT_131';  //北京
        let checkInDate = '2017-09-27';
        let checkOutDate = '2017-09-28';
        let location = {
            latitude: 39.929986,
            longitude: 116.395645
        }
        for(let i =0; i < hotel_levels.length; i++) {
            let qs = {local: {
                checkInDate,
                checkOutDate,
                star: hotel_levels[i],
                latitude: location.latitude,
                longitude: location.longitude,
            }};
            it(`when hotelStar equals ${hotel_levels[i]}`, async function(){
                let allPrefers = loadPrefers([], qs, DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_HOTEL);
                let strategy = await HotelBudgetStrategyFactory.getStrategy({
                    star: hotel_levels[i],
                    checkInDate,
                    checkOutDate,
                    prefers: allPrefers,
                    city: cityId,
                    location,
                }, {isRecord: true});

                let isRetMarkedData = false;
                let budget = await strategy.getResult(hotelDomestic, isRetMarkedData, 'CNY');
                assert.equal(budget.name, result[i], [`星级${hotel_levels[i]}, 打分后结果：${result[i]}`])
            })
        }
        // describe('Domestic-Hotel-Price',async function () {
        //     let checkInDate = '2017-09-27';
        //     let checkOutDate = '2017-09-28';
        //     let location = {
        //         latitude: 39.929986,
        //         longitude: 116.395645
        //     }
        //
        //     for(let i = 0; i < hotel_levels.length; i++) {
        //         let qs = {local: {
        //             checkInDate,
        //             checkOutDate,
        //             star: hotel_levels[i],
        //             latitude: location.latitude,
        //             longitude: location.longitude,
        //         }};
        //         it(`result when hotelStar equals ${hotel_levels[i]}`, async function(){
        //             let allPrefers = loadPrefers([], qs, DEFAULT_PREFER_CONFIG_TYPE.ABROAD_HOTEL);
        //             let pricePreferConfig:any = {};
        //             for(let j = 0; j < allPrefers.length; j++){
        //                 if(allPrefers[j].name == 'price') {
        //                     pricePreferConfig = allPrefers[j];
        //                 }
        //             }
        //             if(typeof(pricePreferConfig) == 'string') {
        //                 pricePreferConfig = JSON.parse(pricePreferConfig);
        //             }
        //             let pricePrefer = new PricePrefer(pricePreferConfig.name, pricePreferConfig.options);
        //
        //
        //             if(typeof(hotelDomestic) == 'string') hotelDomestic = JSON.parse(hotelDomestic)
        //
        //             let result = await pricePrefer.markScoreProcess(hotelDomestic);
        //             result = result.sort(function(item1, item2){
        //                 if(item1.score > item2.score){
        //                     return -1;
        //                 } else if(item1.score <= item2.score){
        //                     return 1;
        //                 }
        //             });
        //             assert.equal(result[0].name, '北京乾元酒店');
        //             assert.ok(true)
        //
        //         })
        //     }
        //
        // });
    });

    describe('Abroad-Traffic-Price-As-Whole', function () {
        let result = ['纽约永兴酒店(Windsor Hotel New York)', '纽约智选假日酒店 - 时代广场店(Holiday Inn Express - Times Square New York)',
            '纽约曼哈顿金融区假日酒店(Holiday Inn Manhattan Financial District New York)', '纽约市布莱恩公园酒店(The Bryant Park Hotel New York City)']
        let cityId = 'CTW_301';  //纽约
        let checkInDate = '2017-09-28';
        let checkOutDate = '2017-09-30';
        let location = {
            latitude: 40.7127837,
            longitude: -74.0059413
        }


        for(let i =0; i < hotel_levels.length; i++) {

            let qs = {local: {
                checkInDate,
                checkOutDate,
                star: hotel_levels[i],
                latitude: location.latitude,
                longitude: location.longitude,
            }};
            it(`when hotelStar equals ${hotel_levels[i]}`, async function(){
                let allPrefers = loadPrefers([], qs, DEFAULT_PREFER_CONFIG_TYPE.ABROAD_HOTEL);
                let strategy = await HotelBudgetStrategyFactory.getStrategy({
                    star: hotel_levels[i],
                    checkInDate,
                    checkOutDate,
                    prefers: allPrefers,
                    city: cityId,
                    location,
                }, {isRecord: true});

                let isRetMarkedData = false;
                let budget = await strategy.getResult(hotelAbroad, isRetMarkedData, 'CNY');

                assert.equal(budget.name, result[i], [`星级${hotel_levels[i]}, 打分后结果：${result[i]}`])
                // it(`星级${hotel_levels[i]}, 打分后结果：${result[i]}`);
            })
        }
    });
})
