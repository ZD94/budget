/**
 * Created by wlh on 2018/3/8.
 */
'use strict';
import assert = require("assert");
import TicketRefusedPlanePrefer = require('../../../../model/budget/prefer/ticket-refusedPlane');
import { IFinalTicket } from 'model/budget/prefer/interface';
const trafficData = require("./traffic-data.json");
const dataLength = 101;
const planeIndex = [];
const notPlaneIndex = [];
const initScore = -5000;
const fs = require("fs")
describe("traffic-refusedPlane", async () => {

    const prefer = new TicketRefusedPlanePrefer('ticketRefusedPlanePrefer', {score: -initScore});

    it("data length should be ok", async () => {
        assert.equal(dataLength, trafficData.length);
    })

    it("用例2 should be ok", async()=> {
        let result = await prefer.markScoreProcess(trafficData);
        await Promise.all(result.map(async (item: IFinalTicket, index: number) => {
            if(planeIndex.indexOf(index) >= 0){
                assert.equal(item.score, initScore);
            }
            if(notPlaneIndex.indexOf(index) < 0){
                assert.equal(item.score, initScore);
            }
        }));
        // fs.writeFileSync("./file.json", JSON.stringify(result), 'utf-8');
        // assert.equal(result)
    })

    var items = [3, 4, 5, 6];
    items.forEach( (item) => {
        it(`用例${item} should be ok`, async() => {
           
        })
    })
})