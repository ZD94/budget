/*
 * @Author: Mr.He 
 * @Date: 2018-03-08 17:53:36 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-03-08 18:57:12
 * @content what is the content of this file. */

import assert = require("assert");
import ScoreItem = require('../../../../model/budget/prefer/hotel-star-match');
let data = require("./hotel-data");

describe("hotel-star-match", async () => {

    before(function () {
        data.map((item) => {
            delete item.score;
            delete item.reasons;
        });
        const prefer = new ScoreItem('hotelStarMatch', {
            score: 2000,
            expectStar: "2,3,4"
        });
        prefer.markScoreProcess(data);
    });

    it("数据第一项，四星级，应该被打分", async () => {
        assert.equal(data[0].score, 2000);
    });

    it("数据第七项，三星级，应该被打分", async () => {
        assert.equal(data[6].score, 2000);
    });

    it("数据第87项，二星级，应该被打分", async () => {
        assert.equal(data[86].score, 2000);
    });

    it("数据第二项，五星级，不应该被打分", async () => {
        assert.notEqual(data[1].score, 2000);
    });
});