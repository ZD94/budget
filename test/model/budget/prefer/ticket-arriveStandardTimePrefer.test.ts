'use strict';
import assert = require("assert")
import TicketArriveStandardTimePrefet = require('../../../../model/budget/prefer/ticket-arriveStandardTimePrefer')

const data = require("./traffic-data.json");

describe("ticket-arriveStandardTimePrefer", async () => {
    before(function () {
        data.map((item) => {
            delete item.score
            delete item.reasons
        })

        const prefer = new TicketArriveStandardTimePrefet("ticketArriveStandardTimePrefet", {
            begin: "2018-03-11T03:30:00.000Z",
            end: "2018-03-11T05:35:00.000Z",
            score: 0,
            scoreInterval: 1
        })
        prefer.markScoreProcess(data)
    })

    it("第50条 到达时间符合基准时间 不打分 should be ok", async () => {
        assert.equal(data[50].score, 0)
    })

    it("第51条 到达时间早于基准时间  打分值55 should be ok", async () => {
        assert.equal(data[51].score, 55)
    })

    it("第52条 到达时间晚于基准时间  打分值180 should be ok", async () => {
        assert.equal(data[52].score, 180)
    })

})

