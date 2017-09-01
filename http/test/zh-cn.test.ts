import request = require("request");
let target = 'http://localhost:4004';
let prefix = '/api/v1'
import util = require("../util");
import assert = require("assert");

describe.skip("zh-cn", function() {

    it("GET /city?keyword= should be ok", function(done) {
        var data = {
            keyword: "北京"
        }
        var secret = 'jinglisecret'
        var appid = '00000000-0000-0000-0000-000000000001';
        var timestamp = Date.now();
        var headers = {
            sign: util.getSign({secret, timestamp, data}),
            appid: appid,
            timestamp: timestamp
        }
        request({
            uri: target+prefix+ '/city',
            method: 'GET',
            qs: {
                keyword: data.keyword,
            },
            headers: headers,
        }, function(err, resp: any) {
                if (err) throw err;
                let result = resp.body;
                if (typeof result == 'string') {
                    result = JSON.parse(result);
                }
                console.log(result);
                assert.equal(result.code, 0);
                assert.equal(result.data.cities.length, 1);
                done();
        })
    })
})