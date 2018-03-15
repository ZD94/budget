'use strict';
const data = require('./traffic-data.json');
import assert = require('assert')
import TicketTrainDurationPrefer = require('../../../../model/budget/prefer/ticket-trainDurationPrefer')

describe("ticket-trainDurationPrefer", async () => {
    before(function () {
        data.map((item) => {
            delete item.score
            delete item.reasons
        })
        const prefer = new TicketTrainDurationPrefer("ticket-trainDurationPrefer", {
            score:100,
    })
        prefer.markScoreProcess(data)
    })

    it("第184条  符合火车时长 打分 shoule be ok", async () => {
        assert.equal(data[184].score, 100)
    })

    it("第185条  不符合火车时长 不打分 should be ok",async()=>{
        assert.equal(data[185].score,0)
    })


})
