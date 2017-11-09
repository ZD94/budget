import request = require("supertest");
import assert = require("assert");
const md5 = require('md5');

import { getFullPath, getToken, setTokenExpire } from './helper';

const cityId = 2038349;
const keyword = '北京'
const target = getFullPath('/place');
const location = {
    longitude: 116.397,
    latitude: 39.9169
}

describe('test place api', () => {

    it(`#GET /${cityId} should be ok`, done => {
        request(target)
            .get(`/${cityId}`)
            .end((err, res) => {
                if (err) done(err)
                assert.equal(res.body.code, 0)
                done()
            })
    })

    it(`#GET /search/${keyword} should be ok`, done => {
        request(target)
            .get(`/search/${encodeURIComponent(keyword)}`)
            .end((err, res) => {
                if (err) done(err)
                assert.equal(res.body.code, 0)
                done()
            })
    })

    it(`#GET /${cityId}/children should be ok`, done => {
        request(target)
            .get(`/${cityId}/children`)
            .end((err, res) => {
                if (err) done(err)
                assert.equal(res.body.code, 0)
                done()
            })
    })

    it(`#GET /nearby/${location.longitude}/${location.latitude} should be ok`, done => {
        request(target)
            .get(`/nearby/${location.longitude}/${location.latitude}`)
            .end((err, res) => {
                if (err) done(err)
                assert.equal(res.body.code, 0)
                done()
            })
    })
});

