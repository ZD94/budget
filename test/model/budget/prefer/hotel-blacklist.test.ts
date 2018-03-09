/**
 * Created by wlh on 2018/3/8.
 */
'use strict';
import assert = require("assert");
import HotelBlackListPrefer = require('../../../../model/budget/prefer/hotel-blacklist');

let data = require("./hotel-data");

describe("hotel-blacklist", async () => {

    before(function () {
        data.map((item) => {
            delete item.score;
            delete item.reasons;
        });
        const prefer = new HotelBlackListPrefer('hotelBlackListPrefer', {
            score: -1000
        });
        prefer.markScoreProcess(data);
    });

    it("数据第二项应该被打分", async () => {
        //#todo 完善用例1
        assert.equal(data[1].score, -1000);
    });

    it("数据第三项应该被打分", async () => {
        //#todo  完善用例2
        assert.equal(data[2].score, -1000);
    });
});
