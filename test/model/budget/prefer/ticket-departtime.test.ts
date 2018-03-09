/**
 * Created by wlh on 2018/3/8.
 */
'use strict';
import assert = require("assert");
import TicketDepartTimePrefer = require('../../../../model/budget/prefer/ticket-departtime');
const data = require("./traffic-data.json");


describe("ticket-departtime", async () => {
    before(function () {
        data.map((item) => {
            delete item.score
            delete item.reasons

        })
        const prefer = new TicketDepartTimePrefer('ticketDepartTime', {
            begin: "2018-03-11T02:05:00.000Z",
            end: "2018-03-11T07:43:00.000Z",
            score: -100
        });
        prefer.markScoreProcess(data)
    })

    it("第5条 准时到达 不打分 should be ok", async () => {
        assert.equal(data[5].score, 0)
    })

    it("第6条 出发时间早于规定时间 打分 should be ok", async () => {
        assert.equal(data[6].score, -100)
    })

    it("第7条 出发时间晚于规定时间 打分 should be ok", async () => {
        assert.equal(data[7].score,-100)
    })

    it("第21条 无出发时间  不打分 should be ok ",async()=>{
        assert.equal(data[21].score,0)
    })
})