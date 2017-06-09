/**
 * Created by wlh on 2017/6/9.
 */

'use strict';
import API from '@jingli/dnode-api';
import moment = require("moment");
import util = require("util");
import assert = require("assert");

describe("traffic", function() {

    this.timeout(30 * 1000);
    it("#search_tickets should be ok", async function() {
        try {
            let result = await API['traffic'].search_tickets({
                leaveDate: moment().add(3, 'days').format("YYYY-MM-DD"),
                originPlace: "CT_289",
                destination: "CT_131"
            });

            assert.equal(util.isArray(result), true);
        } catch(err) {
            throw err;
        }
    })
})