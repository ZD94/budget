/**
 * Created by wlh on 2017/11/1.
 */


'use strict';

import request = require("request");
import {getFullPath, getToken} from "./helper";
import assert = require("assert");


describe("/city", function() {

    it("GET /city should be ok", function() {
        var options = {
            uri: getFullPath('/city'),
            headers: {
                token: getToken(),
            },
            json: true,
        }
        return new Promise(function(resolve, reject) {
            request.get(options, (err, resp) => {
                if (err) {
                    return reject(err);
                }
                let result = resp.body;
                // console.log("result=====>", result)
                assert.equal(result.code, 0);
                assert.equal(result.data.length > 0, true);
                resolve(true);
            })
        });
    })

    it(`GET /city/:id should be ok with ID`, (done)=> {
        request.get({
            uri: getFullPath("/city/CT_131"),
            headers: {
                token: getToken(),
            },
            json: true,
        }, function(err, resp) {
            if (err)
                throw err;
            var result = resp.body;
            assert.equal(result.code, 0);
            done();
        })
    })
})