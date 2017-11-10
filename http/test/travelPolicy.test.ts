import request = require('supertest');
import assert = require('assert');
import { getFullPath, getToken } from "./helper";

describe('/travelPolicy', () => {
    const url = getFullPath('/travelPolicy');
    const tpId = 'bd1dfd40-c362-11e7-b67b-adb21148d5a3'
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

    it(`#GET /`, done => {
        request(url)
            .get('/')
            .set({ token })
            .end((err, res) => {
                if (err) return done(err)
                console.log('tps=====>', res.body.data)
                assert.equal(res.body.code, 0)
                done()
            })
    })

    it(`#GET /${tpId}`, done => {
        request(url)
            .get(`/${tpId}`)
            .set({ token })
            .end((err, res) => {
                if (err) return done(err)
                console.log('tpDetail:', res.body.data)
                assert.equal(res.body.code, 0)
                done()
            })
    })

})