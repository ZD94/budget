import request = require('supertest');
import assert = require('assert');
import { getFullPath, getToken } from "./helper";

describe('/budget', () => {
    const url = getFullPath('/budget');
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
            .send({
                fromCity: 'CT_131',
                ret: 1,
                backCity:'CT_289',
                beginDate: new Date(),
                travelPolicyId: '1a83e0e0-c48e-11e7-8bfd-9faba0c3ba2e',
                segments: [{
                    beginTime: '2017-11-11',
                    destinationPlace: 'CT_332',
                    leaveDate: new Date(),
                    goBackDate: new Date(),
                    noTraffic: false,
                    noHotel: false,
                    city: 'CT_131',
                    // latestArrivalDateTime: '2017-11-13',
                    // earliestDepartTime: '2017-11-11',
                    endTime: '2017-11-13',
                }],
                staffs: [{
                    // accountId: "5b683130-c48c-11e7-a868-cfdd32cc104a",
                    // addWay: 0,
                    // avatar: "",
                    // avatarColor: "",
                    // balancePoints: "0.00",
                    // companyId: "5b685840-c48c-11e7-8009-e5dd826e22cc",
                    // id: "5b683130-c48c-11e7-8009-e5dd826e22cc",
                    // isTiped: true,
                    // name: "张灵玉",
                    // roleId: 0,
                    sex: 1,
                    // staffStatus: 1,
                    // totalPoints: "0.00",
                    travelPolicyId: "1a83e0e0-c48e-11e7-8bfd-9faba0c3ba2e",
                }],
            })
            .set({ token })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                console.log(res.body.data)
                assert.equal(res.body.code, 0)
                done()
            })
    })

    it(`#GET /:id`, done => {
        request(url)
            .get(`/fbc44b00-c5fe-11e7-97dc-e91e34625ca8`)
            .set({ token })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                console.log(res.body.data)
                assert.equal(res.body.code, 0)
                done()
            })
    })

    it.skip(`#POST /:id/refresh`, done => {
        request(url)
            .post(`/fbc44b00-c5fe-11e7-97dc-e91e34625ca8/refresh`)
            .set({ token })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                assert.equal(res.body.code, 0)
                done()
            })
    })

})