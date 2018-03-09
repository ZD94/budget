/**
 * Created by wlh on 2018/3/8.
 */


'use strict';
import assert = require("assert")
const data = require("./traffic-data.json");
import TicketArrivalTimePrefer = require("../../../../model/budget/prefer/ticket-arrivaltime")


describe("ticket-arrivaltime", async () => {
    before(function () {
        data.map((item) => {
            delete item.score
            delete item.reasons
        })
        const prefer = new TicketArrivalTimePrefer("ticketArrivalTime", {
            begin: "2018-03-11T02:00:00.000Z",
            end: "2018-03-11T06:28:00.000Z",
            score: -100
        });
        prefer.markScoreProcess(data);
    })

    it("第1条 准时到达 不打分 should be ok", async () => {
        assert.equal(data[1].score, 0)
    });

    it("第2条  到达时间晚于规定时间 打分 should be ok", async () => {
        assert.equal(data[2].score, -100)
    })

    it("第3条 到达时间早于规定时间 打分 should be ok", async () => {
        assert.equal(data[3].score, -100)
    })

    it("第19条 到达时间晚于规定时间 打分 should be ok", async () => {
        assert.equal(data[19].score, -100)
    })

    it("第21条  无到达时间  不打分  shou be ok", async () => {
        assert.equal(data[21].score,0)
    })

});