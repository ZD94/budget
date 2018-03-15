'use strict';
import assert = require("assert");
import TicketTransitCityInChina = require('../../../../model/budget/prefer/ticket-transitCityInChinaPrefer');
import { IFinalTicket, ETrainSeat } from '../../../../model/budget/prefer/interface';
import {IFinalTicketTest} from "./ticket-refusedPlane.test"
const trafficData = require("./traffic-data.json");

// const fs = require("fs")
// fs.writeFileSync("./file.json", JSON.stringify(result), 'utf-8');

const baseScore = 5000;
var result;
describe("ticket-transitCityInChina", async () => {

    before(async () => {
        await Promise.all(trafficData.map((item: IFinalTicketTest) => {
            delete item.score;
            delete item.reasons;
        })); 
    
        const prefer = new TicketTransitCityInChina("transitCityInChina", {
            baseScore
        });
        
        result = await prefer.markScoreProcess(trafficData);
        // fs.writeFileSync("./file.json", JSON.stringify(result), 'utf-8');    
    })
    
  
    it("第97项 中转城市包含国内机场 should be ok", async () => {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([97].indexOf(item.index) >= 0) {
                assert.equal(item.score, 5000);
            } 
        }))
    })

    it("第110项 单程航班 should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([110].indexOf(item.index) >= 0) {
                assert.equal(item.score, 0);
            }      
        }));
    })

    it("第107 火车 should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([107].indexOf(item.index) >= 0) {
                assert.equal(item.score, 0);
            }
        }));
    })

});



