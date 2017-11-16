import request = require('supertest');
import assert = require('assert');
import { getFullPath, getToken, validate, verifyReturnSign } from "./helper";

const TravelPolicyFields = ['id', 'name', 'desc']

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
                assert.equal(res.body.code, 0)
                assert.equal(verifyReturnSign(res.body), true)
                assert.equal(typeof res.body.data[0], 'string')
                done()
            })
    })

    it(`#GET /${tpId}`, done => {
        request(url)
            .get(`/${tpId}`)
            .set({ token })
            .end((err, res) => {
                if (err) return done(err)
                assert.equal(res.body.code, 0)
                assert.equal(verifyReturnSign(res.body), true)
                const [isValid, missed, extra] = validate(Object.keys(res.body.data), TravelPolicyFields)
                console.log(`Missing fields:`, missed)
                console.log(`Extra fields:`, extra)
                assert.equal(isValid, true)
                done()
            })
    })
})
