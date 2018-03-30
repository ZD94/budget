/**
 * Created by wlh on 2018/3/8.
 */

'use strict';
import assert = require("assert")
const data = require("./traffic-data.json");
import TicketCabinPrefer = require("../../../../model/budget/prefer/ticket-cabin")


describe("ticket-cabin", async () => {
    before(function () {
        data.map((item) => {
            delete item.score;
            delete item.reasons
        })
        const prefer = new TicketCabinPrefer("ticketCabinPrefer", {
            expectTrainCabins:[1,3,4,6],
            expectFlightCabins: [2, 3],
            score: 100
        })
        prefer.markScoreProcess(data)
    });

    it("第30条  飞机座次符合规定  打分 should be ok", async () => {
        assert.equal(data[30].score, 100)
    })

    it("第31条 飞机座次不符合规定  不打分  should be ok", async () => {
        assert.equal(data[31].score, 0)
    })

    it("第32条  飞机座次空cabin值 不打分 should be ok ",async()=>{
        assert.equal(data[32].score, 0)
    })

    it("第9条 火车座次符合规定 打分 should be ok",async()=>{
        assert.equal(data[9].score,100)
    })

    it("第10条 火车座次不符合规定 不打分 should be ok",async()=>{
        assert.equal(data[10].score,0)
    })

    it("第11条 火车座次空cabin值 不打分 should be ok",async()=>{
        assert.equal(data[11].score,0)
    })
});