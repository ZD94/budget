/**
 * Created by wlh on 2018/3/8.
 */
'use strict';
import assert = require("assert");
import HotelBlackListPrefer = require('../../../../model/budget/prefer/hotel-blacklist');
let data = require("./hotel-data");

describe("hotel-blacklist", async () => {

    const prefer = new HotelBlackListPrefer('hotelBlackListPrefer', {
        score: -1000
    });

    it("用例1 should be ok", async () => {
        //#todo 完善用例1

    });

    it("用例2 should be ok", async () => {
        //#todo  完善用例2
    });

    var items = [3, 4, 5, 6];
    items.forEach((item) => {
        it(`用例${item} should be ok`, async () => {
            //#todo 完善${item}
        })
    })
})