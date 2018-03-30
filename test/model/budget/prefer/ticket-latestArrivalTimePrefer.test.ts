'use strict'
const data = require("./traffic-data.json")
import assert = require('assert')
import TicketLatesArrivalTimePrefer = require('../../../../model/budget/prefer/ticket-latestArrivalTimePrefer')

describe("ticket-latesArrivalTimePrefer", async () => {
    before(function () {
        data.map((item) => {
            delete item.score
            delete item.reasons
        });
        const prefer = new TicketLatesArrivalTimePrefer("ticketLatesArrivalTimePrefer", {
            latestArrivalTime: '2018-03-12T12:04:00.000Z',
            score: 100

        });
        prefer.markScoreProcess(data)
    });

    it("第190条 去程到达时间符合出行条件 打分 should be ok", async () => {
        assert.equal(data[190].score, 100)
    })

    it("第192条 去程到达时间不符合出行条件 不打分 should be ok", async () => {
        assert.equal(data[192].score, 0)
    })

    it("第193条 去程时间为null 打分 should be ok", async () => {
        assert.equal(data[193].score, 100)
    })

    it("第194条 去程时间为空字符串 不打分 should be ok", async () => {
        assert.equal(data[194].score, 0)
    })

    it("第195条 数据无去程时间字段 不打分 should be ok", async () => {
        assert.equal(data[195].score, 0)
    })

});

