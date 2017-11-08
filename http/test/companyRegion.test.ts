/**
 * Created by wlh on 2017/11/2.
 */

const request = require('supertest');
const assert = require('assert');
import { getFullPath, getToken } from "./helper";

describe('/companyRegion', () => {
    const regions = [];
    const url = getFullPath('/companyRegion');

    // async function getData() {
    //     const resp = await request(url)
    //         .get('/')
    //         .set('token', getToken())
    //     regions.push(...resp.body.data)
    // }

    // before(done => {
    //     getData().then(done)
    // })

    it('GET /', done => {
        request(url)
            .get('/')
            .set('token', getToken())
            .expect(200)
            .end((err, resp) => {
                if (err) return done(err);
                regions.push([...resp.body.data]);
                done(assert.equal(resp.body.code, 0));
            });
    });

    it('GET /:id', done => {
        request(url)
            .get(`/${regions[0].id}`)
            .set('token', getToken())
            .expect(200)
            .end((err, resp) => {
                if (err) return done(err);
                assert.equal(resp.body.code, 0);
                assert.equal(typeof resp.body.data, 'object');
                done();
            })
    });

    it('PUT /:id', done => {
        request(url)
            .put(`/${regions[0].id}`)
            .set('token', getToken())
            .set('Content-Type', 'application/json')
            .send({ name: '测试名字' })
            .expect(200)
            .end((err, resp) => {
                if (err) return done(err);
                assert.equal(resp.body.code, 0);
                assert.equal(resp.body.data.name, '测试名字');
                done();
            });
    });

    it('DELETE /:id', done => {
        request(url)
            .delete(`/${regions[0].id}`)
            .set({ token: getToken() })
            .expect(200)
            .end((err, resp) => {
                if (err) return done(err);
                assert.equal(resp.body.code, 0);
                done();
            });
    });


})
