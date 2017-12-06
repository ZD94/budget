import request = require("supertest");
import assert = require("assert");
const md5 = require('md5');

import { getFullPath, getToken, setTokenExpire, validate, verifyReturnSign } from './helper';
import { verifySign } from '@jingli/sign';

describe('/agent', () => {

    const url = getFullPath('/agent')
    const appId = '756b12b3-e243-41ae-982f-dbdfb7ea7e92'
    const appSecret = '6c8f2cfd-7aa4-48c7-9d5e-913896acec12'
    const timestamp = Date.now()
    const sign = md5(appSecret + '|' + timestamp)

    it('getToken with all parameters should be ok', done => {
        request(url)
            .post('/gettoken')
            .send({ appId, timestamp, sign })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                assert.equal(res.body.code, 0)
                assert.equal(verifySign(res.body, res.header['sign'], appSecret), true)
                assert.equal(res.header['appid'], appId)
                done()
            })
    })

    it('getToken without appId should be 401', done => {
        request(url)
            .post('/gettoken')
            .send({ timestamp, sign })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                assert.equal(res.body.code, 401)
                assert.equal(verifySign(res.body, res.header['sign'], '00000000'), true)
                assert.equal(res.header['appid'], '00000000')
                done()
            })
    })

})

