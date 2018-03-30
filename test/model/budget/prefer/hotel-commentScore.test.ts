/*
 * @Author: Mr.He 
 * @Date: 2018-03-08 17:53:36 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-03-09 15:02:49
 * @content what is the content of this file. */

import assert = require("assert");
import ScoreItem = require('../../../../model/budget/prefer/hotel-commentScore');
let hotelData = require("./hotel-data");

describe("hotel-commentScore", async () => {

    before(function () {
        hotelData.map((item) => {
            delete item.score;
            delete item.reasons;
        });

        let hotel = new ScoreItem('hotel-commentScore', {
            score: 10000
        });

        hotel.markScoreProcess(hotelData);
    });

    it("酒店数据第45项, commentScore 应该被打分 190200", async () => {
        assert.equal(hotelData[45].score, 190200);
    });

    it("酒店数据第60项, commentScore 应该被打分 151673", async () => {
        assert.equal(hotelData[60].score, 151673);
    });

    it("酒店数据第83项，没有commentScore数据, 不应该打分", async () => {
        assert.equal(hotelData[83].score, undefined);
    });
});