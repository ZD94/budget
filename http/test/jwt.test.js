const request = require("supertest");
const assert = require("assert");
const md5 = require('md5');
const prefixUrl = '/api/v1';

const target = 'http://localhost:4003';
const account = {
    username: '17600323807',
    pwd: 'e10adc3949ba59abbe56e057f20f883e',
    timestamp: Date.now(),
    sign: md5([this.username, this.pwd, this.timestamp].join('|'))
};

describe('jwt', () => {
    it('should return 200 with token', done => {
        console.log('in')
        request(target)
            .post(prefixUrl + '/auth/login')
            .set('username', account.username)
            .set('timestamp', account.timestamp)
            .set('sign', account.sign)
            .end((err, res) => {
                if (err) done(err)
                const result = JSON.stringify(res.body);
                done(assert.equal(result.code, 0))
            })
    })
})
