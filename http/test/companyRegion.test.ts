/**
 * Created by wlh on 2017/11/2.
 */

const request = require('supertest');
const assert = require('assert');
import {getFullPath, getToken} from "./helper";
 
describe('/companyRegion', () => {
    const regions = [];
    const url = getFullPath('/companyRegion');
    it('/', done => {
        request(url)
            .get('/')
            .set('token', getToken())
            .expect(200)
            .end((err, resp) => {
                if(err) return done(err);
                regions.push([...resp.body.data]);
                done(assert.equal(resp.body.code, 0));
            });
    });
    it('/:id', done => {
        request(url)
            .get(`/${regions[0].id}`)
            .set('token', getToken())
            .expect(200)
            .end((err, resp) => {
                if(err) return done(err);
                assert.equal(resp.body.code, 0);
                assert.equal(typeof resp.body.data, 'object');
                done();
            })
    });
})
