/**
 * Created by wlh on 2017/11/2.
 */

import request = require('supertest');
import assert = require('assert');
import { getFullPath, getToken, verifyReturnSign } from "./helper";

describe('/companyRegion', () => {
    let regions = [];
    const url = getFullPath('/companyRegion');
    let token = ''

    async function getData() {
        const token = await getToken()
        const resp: any = await request(url)
            .get('/')
            .set('token', token)
        return [resp.body.data, token]
    }

    before(done => {
        getData().then(([data, tk]) => {
            regions = data
            token = tk
            done()
        })
    })

    it('GET /', done => {
        request(url)
            .get('/')
            .set('token', token)
            .expect(200)
            .end((err, resp) => {
                if (err) return done(err)
                assert.equal(resp.body.code, 0)
                assert.equal(verifyReturnSign(resp.body), true)
                done()
            });
    })

    it('GET /:id', done => {
        request(url)
            .get(`/${regions[0].id}`)
            .set('token', token)
            .expect(200)
            .end((err, resp) => {
                if (err) return done(err)
                assert.equal(resp.body.code, 0);
                assert.equal(verifyReturnSign(resp.body), true)
                assert.equal(typeof resp.body.data, 'object');
                done()
            })
    })

    it.skip('PUT /:id', async  done => {
        request(url)
            .put(`/${regions[0].id}`)
            .set('token', await getToken())
            .set('Content-Type', 'application/json')
            .send({ name: '测试名字' })
            .expect(200)
            .end((err, resp) => {
                if (err) return done(err);
                assert.equal(resp.body.code, 0);
                assert.equal(verifyReturnSign(resp.body), true)
                assert.equal(resp.body.data.name, '测试名字');
                done();
            });
    });

    it.skip('DELETE /:id', done => {
        request(url)
            .delete(`/${regions[0].id}`)
            .set({ token: getToken() })
            .expect(200)
            .end((err, resp) => {
                if (err) return done(err);
                assert.equal(resp.body.code, 0);
                assert.equal(verifyReturnSign(resp.body), true)
                done();
            });
    });


})
