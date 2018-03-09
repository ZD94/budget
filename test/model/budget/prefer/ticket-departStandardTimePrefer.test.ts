/**
 * Created by wlh on 2018/3/8.
 */
'use strict';
import assert = require("assert")

const data = require("./traffic-data.json");
import TicketDepartStandardTimePrefer = require("../../../../model/budget/prefer/ticket-departStandardTimePrefer")

describe("ticket-ticketDepartStandardTimePrefer", async () => {
    before(function () {
        data.map((item) => {
            delete data.score
            delete item.reasons
        })
        const prefer = new TicketDepartStandardTimePrefer("ticketDepartStandardTimePrefer", {
            score: 0,
            begin:'2018-03-11T08:00:00.000Z',
            end:'2018-03-11T10:15:00.000Z',
            scoreInterval:1
        })
        prefer.markScoreProcess(data)
    })

    it("第133条  出发时间符合出发基准时间  不打分 should be ok", async () => {
        assert.equal(data[133].score,0)
    })

    it("第134条  出发时间早于出发基准时间计算值 465 should be ok",async()=>{
        assert.equal(data[134].score,465)
    })

    it("第138条  出发时间早于出发基准时间计算值 100 should be ok",async()=>{
        assert.equal(data[139].score,430)
    })

});