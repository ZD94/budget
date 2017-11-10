
import request = require('supertest');
import assert = require('assert');
import { getFullPath, getToken } from "./helper";

describe('/regionPlace', () => {
    const url = getFullPath('/regionPlace');
    let token = ''

    async function getData() {
        const token = await getToken()
        return [token]
    }

    before(done => {
        getData().then(([tk]) => {
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
                console.log(res.body.data)
                assert.equal(res.body.code, 0)
                done()
            })
    })

    it.skip('#POST /', done => {
        request(url)
            .post('/')
            .send({})
            .set({ token })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                assert.equal(res.body.code, 0)
                done()
            })
    })

    it.skip(`#DELETE /:id`, done => {
        request(url)
            .delete(`/${id}`)
            .set({ token })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                assert.equal(res.body.code, 0)
                done()
            })
    })

    it.skip(`#PUT /:id`, done => {
        request(url)
            .put(`/${id}`)
            .set({ token })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                assert.equal(res.body.code, 0)
                done()
            })
    })

})