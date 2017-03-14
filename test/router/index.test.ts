/**
 * Created by wlh on 2017/3/14.
 */

'use strict';

const req = require("supertest");
import assert = require("assert");
import {IQueryBudgetParams} from "../../_type/budget";
const app = require("router");

describe("router.ts", function() {
    const host = "http://localhost:3000/"
    let id = 'fb955ed0-086c-11e7-94a8-87663eec2888';
    let appid = '00000000-0000-0000-0000-000000000001';

    it("GET /v1/budget/:id should be ok", function(done) {
        req(app)
            .get(`/v1/budget/${id}?appid=${appid}`)
            .end(function(err, resp) {
                if (err) throw err;
                assert.equal(200, resp.statusCode);
                done();
            })
    })

    it("POST /v1/budget should be ok", function(done) {
        let data = {
            combineRoom: true,
            policies: {},
            ret: true,
            appid: appid,
            prefers: [],
            tickets: [],
            hotels: [],
            fromCity: {
                id: 'CT_131',
                name: '北京',
                code: 'BJS',
                letter: 'BJ',
                isAbroad: false
            },
            staffs: [],
            segs: [
                {
                    "city": {
                        id: "CT_132",
                        name: "上海",
                        code: "SHA",
                        letter: "SH",
                        isAbroad: false
                    },
                    beginTime: new Date(),
                    endTime: new Date(),
                    location: {
                        latitude: 0,
                        longitude: 0,
                    }
                },
            ]
        }

        req(app)
            .post(`/v1/budget?appid=${appid}`)
            .send("json="+JSON.stringify(data))
            .end( function(err, resp) {
                if (err) throw err;
                assert.equal(200, resp.statusCode);
                console.log(resp.body)
                done();
            })
    })
})