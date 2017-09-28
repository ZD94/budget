/**
 * Created by ycl on 2017/9/26.
 */
'use strict';


/*
 *  测试用例：
 *    1. 酒店价格打分
 *      1.1 原始数据打分（因为国内外打分分值不同：分国内、国外酒店）
 *          1.1.1 偏好设置 percentage 取值 [-1, 0, 0.5, 1, 2]
 *              1.1.1.1 原始数据为空数组
 *              1.1.1.2 原始数据价格相同
 *              1.1.1.3 原始数据价格不相同
 *
 *      1.2 针对不同的酒店舒适度进行打分（酒店舒适度参与价格打分）
 *         1.1.1 偏好设置 percentage 取值 [-1, 0, 0.5, 1, 2]
 *              1.1.1.1 原始数据为空数组
 *              1.1.1.2 原始数据价格相同
 *              1.1.1.3 原始数据价格不相同
 *
 *    2. 交通价格打分
 *       2.1 原始数据打分（因为国内外打分分值不同：分国内、国外酒店）
 *
 *
 */

var assert = require("assert");
var moment = require("moment");
var bluebird = require("bluebird")
var _ = require("lodash");
var fs = require("fs");
import {
    formatHotel, formatTicketData
} from "../strategy/index";

var PricePrefer = require("../prefer/price");

var hotelEmptyArray = require("./data/hotel-empty-array.json");
var hotelPriceEqual = require("./data/hotel-price-equal.json");
var hotelPriceNotEqual = require("./data/hotel-price-not-equal.json");
var hotelPriceNegativeLowest = require("./data/hotel-negative-lowest-price.json");
var hotelPriceNegativeHighest = require("./data/hotel-negative-highest-price.json");


var trafficPriceEqual = require("./data/traffic-price-equal.json");
var trafficPriceNotEqual = require("./data/traffic-price-not-equal.json");
var trafficEmptyArray = require("./data/traffic-empty-array.json");
var trafficNegativeHighestPrice = require("./data/traffic-negative-highest-price.json");
var trafficNegativeLowestPrice = require("./data/traffic-negative-lowest-price.json");
var trafficNegativePrice = require("./data/traffic-negative-price.json");

var hotel_levels = [2,3,4,5];

var traffic = [1,2,3,4,5,6,7,8,9,10];

let hotelData = [
    { name: 'hotelEmptyArray', remark:'酒店数据空数组', data: hotelEmptyArray, method: 'notStrictEqual', expectedResult: [] },
    { name: 'hotelPriceEqual', remark:'酒店数据价格都为2000', data: hotelPriceEqual, method: 'equal' ,expectedResult: hotelPriceEqual},
    { name: 'hotelPriceNotEqual',remark:'酒店数据价格规律变动', data: hotelPriceNotEqual, method: 'equal', expectedResult: [] },
    { name: 'hotelPriceNegativeLowest', remark:'酒店数据价格含最小负值', data: hotelPriceNegativeLowest, method: 'equal',expectedResult: [] },
    { name: 'hotelPriceNegativeHighest', remark:'酒店数据价格含最大负值', data: hotelPriceNegativeHighest, method: 'equal',expectedResult: [] },
    { name: 'trafficNegativePrice', remark:'酒店数据价格全为负值', data: trafficNegativePrice, method: 'equal',expectedResult: [] }
];

let trafficData = [
    { name: 'trafficEmptyArray', remark:'交通数据空数组', data: trafficEmptyArray, method: 'notStrictEqual', expectedResult: [] },
    { name: 'trafficPriceEqual', remark:'交通数据价格都为2000', data: trafficPriceEqual, method: 'equal' ,expectedResult: []},
    { name: 'trafficPriceNotEqual',remark:'交通数据价格规律变动', data: trafficPriceNotEqual, method: 'equal', expectedResult: [] },
    { name: 'trafficNegativeLowestPrice', remark:'交通数据价格含最小负值', data: trafficNegativeLowestPrice, method: 'equal',expectedResult: [] },
    { name: 'trafficNegativeHighestPrice', remark:'交通数据价格含最大负值', data: trafficNegativeHighestPrice, method: 'equal',expectedResult: [] }
    { name: 'trafficNegativePrice', remark:'交通数据价格全为负值', data: trafficNegativePrice, method: 'equal',expectedResult: [] }
];

let percentage = [-1, 0, 0.5, 1, 2];
// let percentage = [ 0.5, 1, 2];

describe('Price-Scoring', function(){
    describe('Hotel-Price-Scoring', async function () {
        for(let i =0; i < percentage.length; i++){
        // for(let i =0; i < 1; i++){
            for (let ii = 0; ii < hotelData.length; ii++) {
            // for (let ii = 0; ii < 1; ii++) {
                let allPrefers ={
                    "name": "price",
                    "options": {
                        "type": "square",
                        "score": 20000,
                        "level": hotel_levels,
                        "percent": percentage[i]
                    }
                };
                let result: any = hotelData[ii].data;
                result = formatHotel(result);

                let pricePrefer = new PricePrefer(allPrefers.name, allPrefers.options);
                result = await pricePrefer.markScoreProcess(result);

                describe(`when 源数据: ${hotelData[ii].remark}, 偏好值是: ${percentage[i]}`, async function() {
                    it(`数组长度比较：Actual: ${result.length}, Expect: ${hotelData[ii].expectedResult.length}`, async function(){
                        assert[hotelData[ii].method](result.length, hotelData[ii].data.length, '打分前后数组长度与期待不符');
                        if(result && result.length){
                            // assert[hotelData[ii].method](result[0].name, hotelData[ii].expectedResult.name, '打分后结果与期待不符');
                        }
                    });
                });

                // fs.writeFileSync(`./${hotelData[ii].name}-${percentage[i]}.json`, JSON.stringify(result), 'utf-8');

            }
        }
    })


    describe('Domestic-Traffic-Price-Scoring', async function () {
        for (let i = 0; i < hotelData.length; i++) {
            for (let i = 0; i < percentage.length; i++) {
                // for(let i =0; i < 1; i++){
                for (let ii = 0; ii < hotelData.length; ii++) {
                    // for (let ii = 0; ii < 1; ii++) {
                    let allPrefers = {
                        "name": "price",
                        "options": {
                            "type": "square",
                            "score": 20000,
                            "level": traffic,
                            "percent": percentage[i]
                        }
                    };
                    let result:any = trafficData[ii].data;
                    result = formatHotel(result);

                    let pricePrefer = new PricePrefer(allPrefers.name, allPrefers.options);
                    result = await pricePrefer.markScoreProcess(result);

                    describe(`when 源数据: ${trafficData[ii].remark}, 偏好值是: ${percentage[i]}`, async function () {
                        it(`数组长度比较：Actual: ${result.length}, Expect: ${trafficData[ii].expectedResult.length}`, async function () {
                            assert[trafficData[ii].method](result.length, trafficData[ii].data.length, '打分前后数组长度与期待不符');
                            if (result && result.length) {
                                // assert[hotelData[ii].method](result[0].name, hotelData[ii].expectedResult.name, '打分后结果与期待不符');
                            }
                        });
                    });
                    // fs.writeFileSync(`./${hotelData[ii].name}-${percentage[i]}.json`, JSON.stringify(result), 'utf-8');

                }
            }
        }
    })

})




