'use strict'
const data = require('./traffic-data.json');
import assert = require('assert')
import TicketTrainPricePrefer = require('../../../../model/budget/prefer/ticket-trainPricePrefer')

describe("ticket-TrainPricePrefer", async () => {
    before(function () {
        data.map((item) => {
            delete item.score;
            delete item.reasons;
        })
        const prefer = new TicketTrainPricePrefer('ticket-TrainPricePrefer', {
            expectTrainCabins:[2,4,6],
            score:100
        })
        prefer.markScoreProcess(data)

    })

    it('第220条 火车价格等于偏好价格 打分 should be ok',async()=>{
        assert.equal(data[220].score,100)
    });

    it("第221条 火车价格高于价格偏好以上 不打分 should be ok",async()=>{
        assert.equal(data[221].score,0)
    })

    it('第223条 火车价格低于价格偏好 打分值2 should be ok',async()=>{
        assert.equal(data[223].score,2)
    })

})
