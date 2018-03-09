/*
 * @Author: Mr.He 
 * @Date: 2018-03-08 17:53:36 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-03-09 14:39:34
 * @content what is the content of this file. */

import assert = require("assert");
import ScoreItem = require('../../../../model/budget/prefer/price');
let hotelData = require("./hotel-data");
let trafficData = require("./traffic-data");

describe("price", async () => {

    before(function () {
        hotelData.map((item) => {
            delete item.score;
            delete item.reasons;
        });
        trafficData.map((item) => {
            delete item.score;
            delete item.reasons;
        });

        let hotel = new ScoreItem('price', {
            score: 10000,
            percent: 0.5,
            level: [2, 4, 5],
            type: "square"
        });

        let traffic = new ScoreItem('price', {
            score: 10000,
            percent: 0.5,
            level: [2, 3],
            type: "line"
        });
        hotel.markScoreProcess(hotelData);
        traffic.markScoreProcess(trafficData);
    });

    it("酒店数据第19项，四星级酒店，价格偏下 应该被打分 6328", async () => {
        assert.equal(hotelData[19].score, 6328);
    });

    it("酒店数据第35项，五星级酒店，价格偏上 应该被打分 8303", async () => {
        assert.equal(hotelData[35].score, 8303);
    });

    it("酒店数据第46项，三星级酒店，不应该打分", async () => {
        assert.equal(hotelData[46].score, 0);
    });


    it("交通数据第45项, 交通，价格偏下 应该被打分 1074", async () => {
        assert.equal(trafficData[45].score, 1074);
    });

    it("交通数据第260项，交通，价格偏上(最大值) 应该被打分 0", async () => {
        assert.equal(trafficData[260].score, 0);
    });

    it("交通数据第261项，火车，不应该打分", async () => {
        assert.equal(trafficData[261].score, undefined);
    });
});