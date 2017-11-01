/**
 * Created by wlh on 2017/4/20.
 */
'use strict';

import request = require("supertest");
// const app = require("../app");
var assert = require("assert");
const TEST_ACCOUNT = ['00000000-0000-0000-0000-000000000001', 'jinglisecret']
var prefixUrl = '/api/v1'
const util = require("../util");

console.log("test...")
// let target = app;

let target = 'http://localhost:4004';

describe("router.js", function() {

    let timestamp = Date.now().toString();
    let secret = TEST_ACCOUNT[1];

    it(`GET ${prefixUrl}/city should be ok with keyword `, function(done) {
        var data = {
            keyword: 'beijing'
        }
        request(target)
            .get(prefixUrl + '/city?keyword='+data.keyword)
            .set("appid", TEST_ACCOUNT[0])
            .set("timestamp", timestamp)
            .set("sign", util.getSign({secret, timestamp, data}))
            .end( (err, resp) => {
                if (err) throw err;
                let result = resp.body;
                console.log(result);
                assert.equal(result.code, 0);
                assert.equal(result.data.cities.length, 1);
                done();
            })
    })

    it(`GET ${prefixUrl}/city/:id should be ok with ID`, (done)=> {
        let data = {};
        request(target)
            .get(prefixUrl + '/city/CT_131')
            .set("appid", TEST_ACCOUNT[0])
            .set("timestamp", timestamp)
            .set("sign", util.getSign({secret, timestamp, data}))
            .end( (err, resp) => {
                if (err) throw err;
                let result = resp.body;
                assert.equal(result.code, 0);
                assert.equal(result.data.cities.length, 1);
                assert.equal(result.data.cities[0].name, '北京');
                done();
            })
    })

    var id;

    it(`POST ${prefixUrl}/budget should be ok`, function(done) {
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
            .post(prefixUrl + '/budget')
            .set("appid", TEST_ACCOUNT[0])
            .set("timestamp", timestamp)
            .set("sign", util.getSign({secret, timestamp, data: params}))
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

    it(`GET ${prefixUrl}/budget/:id should be ok`, (done) => {
        var data = {}
        request(target)
            .get(`${prefixUrl}/budget/${id}`)
            // .set("content-type", "multipart/form-data")
            .set("appid", TEST_ACCOUNT[0])
            .set("timestamp", timestamp)
            .set("sign", util.getSign({secret, timestamp, data}))
            .end( (err, resp) => {
                if (err) throw err;
                let result = resp.body;
                assert.equal(result.code, 0);
                assert.equal(result.data.id, id);
                done();
            })
    })
})