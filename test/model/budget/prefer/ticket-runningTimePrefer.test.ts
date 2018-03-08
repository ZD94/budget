/**
 * Created by wlh on 2018/3/8.
 */
'use strict';
import assert = require("assert")
const trafficData = require("./traffic-data.json");
import TicketRunningTimePrefer = require("../../../../model/budget/prefer/ticket-runningTimePrefer")

describe("ticket-runningTimePrefer", async () => {
    const prefer = new TicketRunningTimePrefer("ticket-runningTimePrefer", {});

    it("用例1 should be ok", async () => {

    })

    it("用例2 should be ok", async()=> {
        //#todo  完善用例2
    })

    var items = [3, 4, 5, 6];
    items.forEach( (item) => {
        it(`用例${item} should be ok`, async() => {
            //#todo 完善${item}
        })
    })
});