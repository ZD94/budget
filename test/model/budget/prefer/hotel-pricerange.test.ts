/*
 * @Author: Mr.He 
 * @Date: 2018-03-08 17:53:36 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-03-08 20:10:41
 * @content what is the content of this file. */

import assert = require("assert");
import ScoreItem = require('../../../../model/budget/prefer/hotel-pricerange');
let data = require("./hotel-data");

describe("hotel-pricerange", async () => {

    before(function () {
        data.map((item) => {
            delete item.score;
            delete item.reasons;
        });
        const prefer = new ScoreItem('hotelPricerange', {
            score: 2000,
            range: {
                2: [200, 400],
                3: [400, 600],
                4: [600, 800],
                5: [1000]
            }
        });
        prefer.markScoreProcess(data);
    });

    it("数据第86项，二星价格不在200～400，应该被打分", async () => {
        assert.equal(data[86].score, 2000);
    });

    it("数据第74项，二星价格在200～400，不应该被打分", async () => {
        assert.notEqual(data[74].score, 2000);
    });

    it("数据第23项，三星价格不在400～600，应该被打分", async () => {
        assert.equal(data[23].score, 2000);
    });

    it("数据第45项，三星价格在400～600，不应该被打分", async () => {
        assert.notEqual(data[45].score, 2000);
    });

    it("数据第70项，四星价格不在600～800，应该被打分", async () => {
        assert.equal(data[70].score, 2000);
    });

    it("数据第48项，四星价格在600～800，不应该被打分", async () => {
        assert.notEqual(data[48].score, 2000);
    });

    it("数据第79项，五星价格<1000，应该被打分", async () => {
        assert.equal(data[79].score, 2000);
    });

    it("数据第81项，五星价格>1000，不应该被打分", async () => {
        assert.notEqual(data[81].score, 2000);
    });
});