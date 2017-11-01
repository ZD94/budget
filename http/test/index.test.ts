/**
 * Created by wlh on 2017/4/20.
 */
'use strict';

import request = require("supertest");
// const app = require("../app");
var assert = require("assert");
const util = require("../util");



describe("router.js", function() {


    var id;

    it(`POST /budget should be ok`, function(done) {
        this.timeout(6 * 1000)

        var params = {
            staffs: [
                {
                    sex: "MALE",
                    policy: "staff"
                }
            ],
            policies: {
                "staff": {
                    hotelStar: ['SECOND', 'THREE'],
                    trainSeat: ['NO_SEAT', "SOFT_SEAT", "HARD_SEAT"],
                    cabin: ['ECONOMY']
                }
            },
            fromCity: "CT_131",
            segments: [
                {
                    city: "CT_132",
                    beginTime: new Date(),
                    endTime: new Date(new Date().valueOf() + 1000 * 60 * 60 * 48),
                    isNeedTraffic: 1,
                    isNeedHotel: 1
                }
            ],
            ret: 1
        }
        request(target)
            .post('/budget')
            .set("content-type", "multipart/form-data")
            .send(JSON.stringify(params))
            .end( (err, resp) => {
                if (err) throw err;
                let result = resp.body;
                // console.log("Result==>", resp)
                // assert.equal(resp.statusC, 200);
                assert.equal(resp.body.code, 0);
                id = result.data.id
                done();
            })
    })

    it(`GET /budget/:id should be ok`, (done) => {
        var data = {}
        request(target)
            .get(`/budget/${id}`)
            // .set("content-type", "multipart/form-data")
            .end( (err, resp) => {
                if (err) throw err;
                let result = resp.body;
                assert.equal(result.code, 0);
                assert.equal(result.data.id, id);
                done();
            })
    })
})