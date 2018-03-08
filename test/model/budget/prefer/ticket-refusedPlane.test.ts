/**
 * Created by wlh on 2018/3/8.
 */
'use strict';
import assert = require("assert");
import TicketRefusedPlanePrefer = require('../../../../model/budget/prefer/ticket-refusedPlane');
// import HotelBlackListPrefer = require('../../../../model/budget/prefer/hotel-blacklist');
// const trafficData = require("./traffic-data.json");
const dataLength = 100;
describe("traffic-refusedPlane", async () => {

    const prefer = new TicketRefusedPlanePrefer('ticketRefusedPlanePrefer', {});

    it("data length should be ok", async () => {
        // assert.equal(dataLength, trafficData.length)
        // assert.equal(dataLength, 100)
       
    })

    it("用例2 should be ok", async()=> {
        
    })

    var items = [3, 4, 5, 6];
    items.forEach( (item) => {
        it(`用例${item} should be ok`, async() => {
           
        })
    })
})