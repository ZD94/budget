/**
 * Created by hxs on 17/9/12.
 */


import path = require("path");
import supertest = require("supertest");
// let app = require("../../server");

// let request = supertest(app);

import request = require("request");
import moment = require("moment");
import uuid = require("uuid");
var expect = require("chai").expect;
import md5 = require("md5");

import { getFullPath, getToken, setTokenExpire } from './helper';

describe("/auth", function () {

    it("POST /auth/login", async () => {
        let token = await getToken();
        console.log(token)
        return token;
    });


    it("POST /auth/quit", async () => {
        const token = await getToken();
        request.post(getFullPath("/auth/quit"), {
            headers: {
                token
            },
        }, (err, httpResponse, body) => {
            if (err) {
                console.log(err);
                return;
            }

            let result;
            try {
                result = JSON.parse(body);
            } catch (e) {
                result = body;
            }
            setTokenExpire();
            expect(result.code).to.be.equal(0);
            return Promise.resolve(true);
        })
    })
});

