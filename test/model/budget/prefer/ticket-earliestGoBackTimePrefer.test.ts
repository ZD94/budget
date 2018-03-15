'use strict'
const data = require('./traffic-data.json')
import assert = require('assert')
import TicketEarliestGoBackTimePrefer = require('../../../../model/budget/prefer/ticket-earliestGoBackTimePrefer')

describe("ticket-earliestGoBackTimePrefer", async () => {
    before(function () {
        data.map((item) => {
            delete item.score;
            delete item.reasons
        })
        const prefer = new TicketEarliestGoBackTimePrefer("ticket-earliestGoBackTimePrefer", {
            earliestGoBackTime: "2018-03-11T00:39:00.000Z",
            score: 100,

        })
        prefer.markScoreProcess(data)
    })

    it("第142条 回程出发时间符合出行时间 打分 should be ok", async () => {
        assert.equal(data[142].score, 100)
    })

    it('第146条 回程出发时间不符合出行时间 不打分 should be ok',async()=>{
        assert.equal(data[146].score,0)
    })

    it('第149条 回程出发时间为空字符 不打分 should be ok',async()=>{
        assert.equal(data[149].score,0)
    })

    it('第147条 回程出发时间为null 不打分 should be ok',async()=>{
        assert.equal(data[147].score,0)
    })
})