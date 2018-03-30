/**
 * Created by wlh on 2018/3/8.
 */
'use strict';
import assert = require("assert")

const data = require("./traffic-data.json");
import TicketCheapSupplierPrefer = require("../../../../model/budget/prefer/ticket-cheapsupplier")


describe("ticket-cheapsupplier", async () => {

    before(function () {
        data.map((item) => {
            delete item.score
            delete item.reasons

        });
        const prefer = new TicketCheapSupplierPrefer("ticketArrivalTime", {
            score: -100,
            cheapSuppliers: ["9C", "KN", "HO", "PN", "EU", "AQ", "JR"]
        });
        prefer.markScoreProcess(data)
    })

    it("第66条  属于廉价供应商 打分 should be ok", async () => {
        assert.equal(data[66].score, -100)
    })

    it("第83条   不属于廉价供应商 不打分 should be ok", async () => {
        assert.equal(data[83].score, 0)
    })

    it("第11条  火车数据  不打分  should be ok ",async()=>{
        assert.equal(data[11].score,0)
    })

    it("第97条  无供应商 不打分 should be ok",async()=>{
        assert.equal(data[97].score,0)
    })

    it("第112条  非法供应商 不打分 should be ok",async()=>{
        assert.equal(data[112].score,0)
    })
});