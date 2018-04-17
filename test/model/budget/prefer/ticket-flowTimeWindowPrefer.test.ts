'use strict'
const data = require('./traffic-data.json');
import assert = require('assert')
import TicketFlowTimeWindowPrefer = require('../../../../model/budget/prefer/ticket-flowTimeWindowPrefer')

describe('ticket-flowTimeWindowPrefer', async () => {

    before(function () {
        data.map((item) => {
            delete item.score;
            delete item.reasons;
        });
        const prefer = new TicketFlowTimeWindowPrefer('ticket-flowTimeWindowPrefer', {
            desiredFromDateTime: "2018-03-11T00:39:00.000Z",
            desiredToDateTime: "2018-03-11T01:39:00.000Z"
        });
        prefer.markScoreProcess(data)
    });

    it('数据第251条 到达时间超出期望时间窗限制 打分-90000 should be ok', async () => {
        assert.equal(data[251].score, -900000)
    })

    it('数据第252条 出发时间超出期望时间窗限制 打分-90000 should be ok', async () => {
        assert.equal(data[252].score, -900000)
    })

    it('数据第253条 出发时间到达时间均超出期望时间窗限制 打分-180000 should be ok', async () => {
        assert.equal(data[253].score,-1800000)
    })

    it('数据第254条 无出发时间 不打分 should be ok',async()=>{
        assert.equal(data[254].score,0)
    })

    it('数据第255条 无到达时间 不打分 should be ok',async()=>{
        assert.equal(data[255].score,0)
    })
});
