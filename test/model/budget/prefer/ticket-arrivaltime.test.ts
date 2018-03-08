/**
 * Created by wlh on 2018/3/8.
 */
'use strict';
import assert = require("assert")

const data = require("./traffic-data.json");
import TicketArrivalTimePrefer = require("../../../../model/budget/prefer/ticket-arrivaltime")

const prefer = new TicketArrivalTimePrefer("ticketArrivalTime", {});
      prefer.markScoreProcess(data)

describe("ticket-arrivaltime", async () => {

    it("用例1 should be ok", async () => {
        console.log(data,"<==========data")
    })

    it("用例2 should be ok", async () => {
        //#todo  完善用例2
    })

    var items = [3, 4, 5, 6];
    items.forEach((item) => {
        it(`用例${item} should be ok`, async () => {
            //#todo 完善${item}
        })
    })
});