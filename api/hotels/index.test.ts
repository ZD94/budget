/**
 * Created by wlh on 2017/6/9.
 */

'use strict';

import API from "@jingli/dnode-api";
import moment = require("moment");
import assert = require("assert");
import util = require("util");

describe("hotel data", function() {
    this.timeout(30 * 1000)
    it("#search_hotels should be ok", async function() {
        let checkInDate = moment().add(3, 'days').format("YYYY-MM-DD");
        let checkOutDate = moment().add(5, 'days').format("YYYY-MM-DD");
        let city = 'CT_131';

        let hotels = await API['hotels'].search_hotels({
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            city: city,
        });
        assert.equal(util.isArray(hotels), true);
    });
})