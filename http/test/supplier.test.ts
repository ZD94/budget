/**
 * Created by mr_squirrel on 30/08/2017.
 */

'use strict'

const req= require('../../node_modules/supertest');
var assert = require('assert');
var prefixUrl = '/api/v2';
var moment = require('moment');

// let id = '278ad260-819c-11e7-b7a9-eb3cc7a71746';
let testname = 'ctrip';
let tar = 'localhost:8080';

describe('supplier API test', function() {
    it('GET /GET', function(done) {
        var data = {
            id: '2496e3c0-8df2-11e7-a29d-679071af3731'
        };
        req(tar)
            .get(prefixUrl + '/supplier/' + data.id)
            .end(function(err, res) {
                if (err){ console.info(err); }
                assert.equal(res.body.data.name, 'qunar');
                done();
            });
    });

    it('FIND /GET', function(done) {
        var data = {
            name: testname
        };
        req(tar)
            .get(prefixUrl + '/supplier?name=' + data.name)
            .end(function(err, res) {
                if (err) { console.info(err); }
                assert.equal(res.body.data[0].id, '278ad260-819c-11e7-b7a9-eb3cc7a71746');
                done();
            });
    });

    it.only('ADD /POST', function(done) {
        var data = {
            name: 'ctrip',
            createdAt: moment.now(),
            updatedAt: moment.now()
        };
        req(tar)
            .post(prefixUrl + '/supplier/')
            .send(data)
            .end(function(err, res) {
                if (err) { console.info(err); }
                assert.equal(res.body.data.name, 'ctrip');
                done();
            });
    });

    it('UPDATE /POST', function(done) {
        var data = {
            id: '278ad260-819c-11e7-b7a9-eb3cc7a71748',
            name: 'tongcheng',
            createdAt: moment.now(),
            updatedAt: moment.now()
        };
        req(tar)
            .put(prefixUrl + '/supplier/' + data.id)
            .send(data)
            .end(function(err, res) {
                if (err) { console.info(err); }
                assert.equal(res.body.data.name, 'tongcheng');
                done();
            });
    });

    it('DELETE /GET', function(done) {
        var data = {
            id: '111a3920-8e18-11e7-b988-2509ac61ba99'
        };
        req(tar)
            .delete(prefixUrl + '/supplier/' + data.id)
            .end(function(err, res) {
                if (err) { console.info(err); }
                assert.equal(res.body.msg, 'ok');
                done();
            });
    });

});





