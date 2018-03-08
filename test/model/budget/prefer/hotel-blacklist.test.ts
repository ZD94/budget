/**
 * Created by wlh on 2018/3/8.
 */
'use strict';
import assert = require("assert");
import HotelBlackListPrefer = require('../../../../model/budget/prefer/hotel-blacklist');

describe("hotel-blacklist", async () => {

    const prefer = new HotelBlackListPrefer('hotelBlackListPrefer', {});
    it("should be ok", async () => {
        let data = [];
        let data2 = await prefer.markScore(data);
        assert.equal(data.length, data2.length);
    })
})