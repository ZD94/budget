'use strict'
import assert = require('assert')

const data = require('./traffic-data.json')
import Stopping = require('../../../../model/budget/prefer/ticket-stopping')


describe('ticketStopping', async () => {
    before(function () {
        data.map((item) => {
            delete item.score;
            delete item.reasons
        });
        const prefer = new Stopping('stopping',{});
        prefer.markScoreProcess(data)
    });

    it('第212条数据不经停  不打分 should be ok',async()=>{
        assert.equal(data[212].score,0)
    });

    it('第211条数据经过一次经停 打分值 -1000 should be ok',async()=>{
        assert.equal(data[211].score,-1000)
    });

    it('第213条数据经过两次经停 打分值 -22000 should be ok',async()=>{
        assert.equal(data[213].score,-22000)
    });

    it('第238条数据经过三次经停 打分值 -43000 should be ok',async()=>{
        assert.equal(data[238].score,-43000)
    });

    it('第214条火车数据 不打分  should be ok',async()=>{
        assert.equal(data[214].score,0)
    })



});