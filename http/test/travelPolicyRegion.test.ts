import request = require('supertest');
import assert = require('assert');
import { getFullPath, getToken, validate, verifyReturnSign } from "./helper";

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

    it(`#GET /`, done => {
        request(url)
            .get('/')
            .set({ token })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                assert.equal(res.body.code, 0)
                assert.equal(verifyReturnSign(res.body), true)
                const [isValid, missed, extra] = validate(Object.keys(res.body.data[0]), TravelPolicyRegionFields)
                console.log(`Missing fields:`, missed)
                console.log(`Extra fields:`, extra)
                assert.equal(isValid, true)
                done()
            })
    })

    // Error
    it(`#POST /`, done => {
        request(url)
            .post('/')
            .field('regionId', regionId)
            .field('policyId', policyId)
            .set({ token })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                assert.equal(res.body.code, 0)
                assert.equal(verifyReturnSign(res.body), true)
                done()
            })
    })

    it(`#DELETE /:id`, done => {
        request(url)
            .delete(`/${tprId}`)
            .set({ token })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                assert.equal(res.body.code, 0)
                assert.equal(verifyReturnSign(res.body), true)
                done()
            })
    })

})

const TravelPolicyRegionFields = [
    'id', 'tripPolicyId', 'regionId',
    'type', 'value'
]
