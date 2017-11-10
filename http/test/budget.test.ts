import request = require('supertest');
import assert = require('assert');
import { getFullPath, getToken } from "./helper";

describe('/travelPolicyRegion', () => {
    const url = getFullPath('/travelPolicyRegion');
    const tprId = 'c35da170-c523-11e7-b7ca-ef8b3ad575ef'
    const policyId = 'bd1dfd40-c362-11e7-b67b-adb21148d5a3'
    const regionId = '6ce098c0-c2e4-11e7-948b-d52ba218de80'
    let token = ''

    async function prepareData() {
        const token = await getToken()
        return [token]
    }

    before(done => {
        prepareData().then(([tk]) => {
            token = tk
            done()
        })
    })

    it(`#POST /`, done => {
        request(url)
            .post('/')
            .send({})
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                assert.equal(res.body.code, 0)
                done()
            })
    })

    it(`#GET /:id`, done => {
        request(url)
            .get(`/${123}`)
            .set({ token })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                assert.equal(res.body.code, 0)
                done()
            })
    })

    it(`#POST /:id/refresh`, done => {
        request(url)
            .post(`/${123}/refresh`)
            .set({ token })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                assert.equal(res.body.code, 0)
                done()
            })
    })

})