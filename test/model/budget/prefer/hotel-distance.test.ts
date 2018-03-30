/*
 * @Author: Mr.He 
 * @Date: 2018-03-08 17:53:36 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-03-08 20:49:23
 * @content what is the content of this file. */

import assert = require("assert");
import ScoreItem = require('../../../../model/budget/prefer/hotel-distance');
let data = require("./hotel-data");

describe("hotel-distance", async () => {

    before(function () {
        data.map((item) => {
            delete item.score;
            delete item.reasons;
        });
        const prefer = new ScoreItem('hotelDistance', {
            score: 2000,
            landmark: {
                longitude: 10,
                latitude: 10
            }
        });
        prefer.markScoreProcess(data);
    });

    it("数据第0项，计算结果检查", async () => {
        assert.equal(data[0].score, -67489);
    });

    it("数据第20项，计算结果检查", async () => {
        assert.equal(data[20].score, -52326);
    });

    it("数据第40项，计算结果检查", async () => {
        assert.equal(data[40].score, -53271);
    });

    it("数据第60项，计算结果检查", async () => {
        assert.equal(data[60].score, -110542);
    });

    it("数据第95项，计算结果检查", async () => {
        assert.equal(data[95].score, -17027);
    });
});