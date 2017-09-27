/**
 * Created by ycl on 2017/9/26.
 */

'use strict';

var assert = require("assert");
var moment = require("moment");
var bluebird = require("bluebird")
var _ = require("lodash");
import {
    TrafficBudgetStrategyFactory, HotelBudgetStrategyFactory
} from "../strategy/index";
import { DEFAULT_PREFER_CONFIG_TYPE} from "../prefer"
import {loadPrefers} from "../prefer";
import {ETrainLevel, EHotelLevel, EPlaneLevel} from "_types/policy/travelPolicy"
import {EAirCabin} from "_types/budget"


var hotelPrefer: any = {
    "domesticHotel": [
        {
            "name": "priceRange",
            "options": {
                "score": -1000000,
                "range": {
                    "5": [450, 2300],
                    "4": [280, 1000],
                    "3": [180, 600],
                    "2": [120, 380]
                }
            }
        },
        {
            "name": "price",
            "options": {
                "score": 20000,
                "percent": 0.05,
                "level": [2]
            }
        },
        {
            "name": "price",
            "options": {
                "score": 20000,
                "percent": 0.05,
                "level": [3]
            }
        },
        {
            "name": "price",
            "options": {
                "score": 20000,
                "percent": 0.05,
                "level": [4]
            }
        },
        {
            "name": "price",
            "options": {
                "score": 20000,
                "percent": 0.05,
                "level": [5]
            }
        }
    ],
    "abroadHotel": [
        {
            "name": "price",
            "options": {
                "score": 20000,
                "percent": 0,
                "level": [2]
            }
        },
        {
            "name": "price",
            "options": {
                "score": 20000,
                "percent": 0,
                "level": [3]
            }
        },
        {
            "name": "price",
            "options": {
                "score": 20000,
                "percent": 0,
                "level": [4]
            }
        },
        {
            "name": "price",
            "options": {
                "score": 20000,
                "percent": 0,
                "level": [5]
            }
        }
    ]
}

var trafficPrefer:any = {
    "domesticTraffic": [
        {
            "name": "cheapSupplier",
            "options": {
                "score": -100000,
                "cheapSuppliers": [
                    "9C",
                    "KN",
                    "HO",
                    "PN",
                    "EU",
                    "AQ",
                    "JR"
                ]
            }
        },
        {
            "name": "trainDurationPrefer",
            "options": {
                "score": 80000,
                "trainDuration": 360
            }
        },
        {
            "name": "price",
            "options": {
                "type": "square",
                "score": 10000,
                "level": [
                    2
                ],
                "percent": 0.05
            }
        },
        {
            "name": "price",
            "options": {
                "type": "square",
                "score": 10000,
                "level": [
                    5
                ],
                "percent": 0.05
            }
        },
        {
            "name": "price",
            "options": {
                "type": "square",
                "score": 10000,
                "level": [
                    3
                ],
                "percent": 0.05
            }
        },
        {
            "name": "price",
            "options": {
                "type": "square",
                "score": 10000,
                "level": [
                    4
                ],
                "percent": 0.05
            }
        }
    ],
    "abroadTraffic": [
        {
            "name": "cheapSupplier",
            "options": {
                "score": -100000,
                "cheapSuppliers": [
                ]
            }
        },
        {
            "name": "price",
            "options": {
                "type": "square",
                "score": 10000,
                "level": [
                    2
                ],
                "percent": 0
            }
        },
        {
            "name": "price",
            "options": {
                "type": "square",
                "score": 10000,
                "level": [
                    5
                ],
                "percent": 0
            }
        },
        {
            "name": "price",
            "options": {
                "type": "square",
                "score": 10000,
                "level": [
                    3
                ],
                "percent": 0
            }
        },
        {
            "name": "price",
            "options": {
                "type": "square",
                "score": 10000,
                "level": [
                    4
                ],
                "percent": 0
            }
        },
        {
            "name": "trainDurationPrefer",
            "options": {
                "score": 80000,
                "trainDuration": 360
            }
        }
    ]
}
var PricePrefer = require("../prefer/price");

var hotelEmptyArray = require("./data/hotel-empty-array.json");
var hotelPriceEqual = require("./data/hotel-price-equal.json");
var hotelPriceNotEqual = require("./data/hotel-price-not-equal.json");
var hotelPriceMax = require("./data/hotel-price-max.json");
// var hotelPriceNAN = require("./data/hotel-price-NAN.json");
// var hotelPriceUndefined = require("./data/hotel-price-undefined.json");
var hotelPriceNull = require("./data/hotel-star-null.json");
// var hotelStarUndefined = require("./data/hotel-star-undefined.json");

var hotel_levels = [2,3,4,5];

var traffic = {
    plane: [2,3,4,5],
    train: [1,2,3,4,5,6,7,8,9,10]
}

/*
 *  测试用例：
 *    1. 酒店价格打分
 *      1.1 原始数据打分（因为国内外打分分值不同：分国内、国外酒店）
 *          1.1.1 国内（国外）
 *              1.1.1.1 原始数据为空数组
 *              1.1.1.1 原始数据为超大数组（比如： 100）
 *              1.1.1.2 原始数据价格相同
 *              1.1.1.3 原始数据价格不相同
 *              1.1.1.4 原始数据价格超过变量允许范围
 *              1.1.1.5 原始数据价格为NAN
 *              1.1.1.6 原始数据价格为null
 *              1.1.1.7 原始数据价格为undefined
 *
 *              1.1.1.8 原始数据星级为null
 *              1.1.1.9 原始数据星级为undefined
 *
 *
 *
 *      1.2 针对不同的酒店舒适度进行打分（酒店舒适度参与价格打分）
 *         1.1.1 国内（国外）
 *              1.1.1.1 舒适度为0
 *              1.1.1.1 舒适度为 0～ 100中某值（比如60）
 *              1.1.1.1 舒适度为100
 *
 *
 *    2. 交通价格打分
 *       2.1 原始数据打分（因为国内外打分分值不同：分国内、国外酒店）
 *
 *
 */


let hotelData = [
    { name: 'hotelEmptyArray', data: hotelEmptyArray, method: 'notStrictEqual' },
    { name: 'hotelPriceEqual', data: hotelPriceEqual, method: 'equal' },
    // { name: 'hotelPriceUndefined', data: hotelPriceUndefined },
    // { name: 'hotelPriceNAN', data: hotelPriceNAN },
    // { name: 'hotelStarUndefined', data: hotelStarUndefined }
];


let expectedResult = {
  hotelEmptyArray: [],
  hotelPriceEqual: {name: '北京和平里宾馆'},
  hotelPriceNotEqual: {name: '北京和平里宾馆'},
  hotelPriceMax: {name: '北京和平里宾馆'},
  hotelPriceNull: {name: '北京和平里宾馆'},
}


describe('Price-Scoring', function(){
    describe('Hotel-Price-Scoring', async function () {
        //仅测试国内酒店价格打分（按照星级）
        describe('Domestic-Hotel-Price-Scoring', async function () {
            let checkInDate = '2017-09-27';
            let checkOutDate = '2017-09-28';
            let location = {
                latitude: 39.929986,
                longitude: 116.395645
            };

            for (let i = 0; i < hotelData.length; i++) {
                let qs = {
                    local: {
                        checkInDate,
                        checkOutDate,
                        star: [EHotelLevel.FIVE_STAR,EHotelLevel.FOUR_STAR, EHotelLevel.THREE_STAR, EHotelLevel.TWO_STAR],
                        latitude: location.latitude,
                        longitude: location.longitude,
                    }
                };
                let hotelPrefers = [60];
                it(`result when original data is ${hotelData[i].name}`, async function () {
                    let allPrefers = hotelPrefer.domesticHotel;
                    //添加舒适度价格打分
                    let allStars = [EHotelLevel.FIVE_STAR, EHotelLevel.FOUR_STAR, EHotelLevel.THREE_STAR, EHotelLevel.TWO_STAR];
                    allStars.forEach((star) => {
                        allPrefers.push({
                            "name": "price",
                            "options": {
                                "type": "square",
                                "score": 50000,
                                "level": [star],
                                "percent": hotelPrefers[0] / 100
                            }
                        })
                    })

                    let pricePreferConfig:any = [];
                    for (let j = 0; j < allPrefers.length; j++) {
                        if (allPrefers[j].name == 'price') {
                            pricePreferConfig.push(allPrefers[j]);
                        }
                    }
                    let result: any = hotelData[i].data;
                    for(let j=0; j < pricePreferConfig.length; j++){
                        let pricePrefer = new PricePrefer(pricePreferConfig[j].name, pricePreferConfig[j].options);
                        result = await pricePrefer.markScoreProcess(result);
                    }

                    result = result.sort(function (item1, item2) {
                        if (item1.score > item2.score) {
                            return -1;
                        } else if (item1.score <= item2.score) {
                            return 1;
                        }
                    });

                    assert.equal(result.length, hotelData[i].data.length, '输入数据和输出数据长度不一致');
                    let recommendedResult = result && result.length > 0 ? result[0].name: result;
                    assert[hotelData[i].method](recommendedResult, expectedResult[hotelData[i].name]['name']);

                    // return new Promise()
                })
            }
        })

        //仅测试国内酒店价格打分（按照星级）
        describe('Abroad-Hotel-Price-Scoring', async function () {
            let checkInDate = '2017-09-27';
            let checkOutDate = '2017-09-28';
            let location = {
                latitude: 39.929986,
                longitude: 116.395645
            };

            for (let i = 0; i < hotelData.length; i++) {
                let qs = {
                    local: {
                        checkInDate,
                        checkOutDate,
                        star: [EHotelLevel.FIVE_STAR,EHotelLevel.FOUR_STAR, EHotelLevel.THREE_STAR, EHotelLevel.TWO_STAR],
                        latitude: location.latitude,
                        longitude: location.longitude,
                    }
                };
                let hotelPrefers = [60];
                it(`result when original data is ${hotelData[i].name}`, async function () {
                    let allPrefers = hotelPrefer.abroadHotel;
                    //添加舒适度价格打分
                    let allStars = [EHotelLevel.FIVE_STAR, EHotelLevel.FOUR_STAR, EHotelLevel.THREE_STAR, EHotelLevel.TWO_STAR];
                    allStars.forEach((star) => {
                        allPrefers.push({
                            "name": "price",
                            "options": {
                                "type": "square",
                                "score": 50000,
                                "level": [star],
                                "percent": hotelPrefers[0] / 100
                            }
                        })
                    })

                    let pricePreferConfig:any = [];
                    for (let j = 0; j < allPrefers.length; j++) {
                        if (allPrefers[j].name == 'price') {
                            pricePreferConfig.push(allPrefers[j]);
                        }
                    }
                    let result: any = hotelData[i].data;
                    for(let j=0; j < pricePreferConfig.length; j++){
                        let pricePrefer = new PricePrefer(pricePreferConfig[j].name, pricePreferConfig[j].options);
                        result = await pricePrefer.markScoreProcess(result);
                    }

                    result = result.sort(function (item1, item2) {
                        if (item1.score > item2.score) {
                            return -1;
                        } else if (item1.score <= item2.score) {
                            return 1;
                        }
                    });

                    assert.equal(result.length, hotelData[i].data.length, '输入数据和输出数据长度不一致');
                    let recommendedResult = result && result.length > 0 ? result[0].name: result;
                    assert[hotelData[i].method](recommendedResult, expectedResult[hotelData[i].name]['name']);

                    // return new Promise()
                })
            }
        })

    })





    describe('Traffic-Price-Scoring', async function () {
        //仅测试国内交通价格打分（按照星级）
        describe('Domestic-Traffic-Price-Scoring', async function () {
            let checkInDate = '2017-09-27';
            let checkOutDate = '2017-09-28';
            let location = {
                latitude: 39.929986,
                longitude: 116.395645
            };

            for (let i = 0; i < hotelData.length; i++) {
                // let qs = {
                //     local: {
                //         expectTrainCabins: traffic.train[ii],
                //         expectFlightCabins: traffic.plane[i],
                //         leaveDate: leaveDate,
                //         earliestLeaveDateTime: new Date(moment(`${leaveDate} 08:00`)),
                //         latestArrivalDateTime: null,
                //     }
                // }

                let trafficPreferValue = 60;
                it(`result when original data is ${hotelData[i].name}`, async function () {
                    let allPrefers = trafficPrefer.domesticTraffic;
                    //添加舒适度价格打分
                    let allCabins = [EAirCabin.BUSINESS, EAirCabin.ECONOMY, EAirCabin.FIRST, EAirCabin.PREMIUM_ECONOMY];
                    allCabins.forEach((cabin) => {
                        allPrefers.push({
                            "name":"price",
                            "options":{
                                "type":"square",
                                "score":50000,
                                "level":[cabin],
                                "percent": trafficPreferValue / 100
                            }
                        })
                    });


                    let pricePreferConfig:any = [];
                    for (let j = 0; j < allPrefers.length; j++) {
                        if (allPrefers[j].name == 'price') {
                            pricePreferConfig.push(allPrefers[j]);
                        }
                    }
                    let result: any = hotelData[i].data;
                    for(let j=0; j < pricePreferConfig.length; j++){
                        let pricePrefer = new PricePrefer(pricePreferConfig[j].name, pricePreferConfig[j].options);
                        result = await pricePrefer.markScoreProcess(result);
                    }

                    result = result.sort(function (item1, item2) {
                        if (item1.score > item2.score) {
                            return -1;
                        } else if (item1.score <= item2.score) {
                            return 1;
                        }
                    });

                    assert.equal(result.length, hotelData[i].data.length, '输入数据和输出数据长度不一致');
                    let recommendedResult = result && result.length > 0 ? result[0].name: result;
                    assert[hotelData[i].method](recommendedResult, expectedResult[hotelData[i].name]['name']);

                    // return new Promise()
                })
            }
        })

        //仅测试国外交通价格打分（按照星级）
        describe('Abroad-Traffic-Price-Scoring', async function () {
            let leaveDate = '2017-09-27';
            let originPlace = 'CT_131';
            let destination = 'CT_289';

            for (let i = 0; i < hotelData.length; i++) {
                // let qs = {
                //     local: {
                //         expectTrainCabins: traffic.train,
                //         expectFlightCabins: traffic.plane,
                //         leaveDate: leaveDate,
                //         earliestLeaveDateTime: new Date(moment(`${leaveDate} 08:00`)),
                //         latestArrivalDateTime: null,
                //     }
                // }
                let trafficPreferValue = 60;
                it(`result when original data is ${hotelData[i].name}`, async function () {
                    let allPrefers = trafficPrefer.abroadTraffic;
                    //添加舒适度价格打分
                    let allCabins = [EAirCabin.BUSINESS, EAirCabin.ECONOMY, EAirCabin.FIRST, EAirCabin.PREMIUM_ECONOMY];
                    allCabins.forEach((cabin) => {
                        allPrefers.push({
                            "name":"price",
                            "options":{
                                "type":"square",
                                "score":50000,
                                "level":[cabin],
                                "percent": trafficPreferValue/100
                            }
                        })
                    });

                    let pricePreferConfig:any = [];
                    for (let j = 0; j < allPrefers.length; j++) {
                        if (allPrefers[j].name == 'price') {
                            pricePreferConfig.push(allPrefers[j]);
                        }
                    }
                    let result: any = hotelData[i].data;
                    for(let j=0; j < pricePreferConfig.length; j++){
                        let pricePrefer = new PricePrefer(pricePreferConfig[j].name, pricePreferConfig[j].options);
                        result = await pricePrefer.markScoreProcess(result);
                    }

                    result = result.sort(function (item1, item2) {
                        if (item1.score > item2.score) {
                            return -1;
                        } else if (item1.score <= item2.score) {
                            return 1;
                        }
                    });

                    assert.equal(result.length, hotelData[i].data.length, '输入数据和输出数据长度不一致');
                    let recommendedResult = result && result.length > 0 ? result[0].name: result;
                    assert[hotelData[i].method](recommendedResult, expectedResult[hotelData[i].name]['name']);

                })
            }
        })

    })

})






