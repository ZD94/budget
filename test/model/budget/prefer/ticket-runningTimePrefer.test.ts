/**
 * Created by wlh on 2018/3/8.
 */
'use strict';
import assert = require("assert")

const data = require("./traffic-data.json");
import TicketRunningTimePrefer = require("../../../../model/budget/prefer/ticket-runningTimePrefer")

describe("ticket-runningTimePrefer", async () => {

    before(function () {
        data.map((item) => {
            delete item.score
            delete item.reasons;
        })
        const prefer = new TicketRunningTimePrefer("ticketRunningTimePrefer", {})
        prefer.markScoreProcess(data)
    })

    it("第49条 飞机运行时长125 打分值500 should be ok",async()=>{
        assert.equal(data[49].score,500)
    })

    it("第41条  飞机运行时长130 打分值 475 should be ok", async () => {
        assert.equal(data[41].score,475)
    })

    it("第258条 飞机运行时长135 打分值450 should be ok",async()=>{
        assert.equal(data[258].score,450)
    })

    it("第253条 火车运行时长1165 打分值 -4255 should be ok",async()=>{
        assert.equal(data[253].score,-4255)
    })

    it("第254条 火车运行时长727  打分值 -2065 should be ok ",async()=>{
        assert.equal(data[254].score,-2065)
    })
});