/**
 * Created by wlh on 2018/3/8.
 */
'use strict';
import assert = require("assert");
import TicketRefusedPlanePrefer = require('../../../../model/budget/prefer/ticket-refusedPlane');
import { IFinalTicket } from '../../../../model/budget/prefer/interface';
const trafficData = require("./traffic-data.json");
const dataLength = 410;
const planeIndex = [264];
const notPlaneIndex = [9, 186];
const initScore = 0;
const finalScore = -5000
// const fs = require("fs")
// fs.writeFileSync("./file.json", JSON.stringify(result), 'utf-8');
export interface IFinalTicketTest extends IFinalTicket {
   index: number
}
describe("traffic-refusedPlane", async () => {

    var prefer = new TicketRefusedPlanePrefer('ticketRefusedPlanePrefer', {
        score: finalScore
    });
    

    it("源数据长度 should be ok", async () => {
        assert.equal(dataLength, trafficData.length);
    })

    it("第264项 交通为飞机，减去5000分 should be ok", async()=> {
        await Promise.all(trafficData.map((item: IFinalTicketTest) => {
            delete item.score;
            delete item.reasons;
        })); 
        let result = await prefer.markScoreProcess(trafficData);  
        
        await Promise.all(result.map(async (item: IFinalTicketTest, index: number) => {
            if(planeIndex.indexOf(item.index) >= 0){
                assert.equal(item.score, finalScore);
            }  
        })); 
    })

    it("第9、186项，交通为火车 打0分 should be ok", async()=> {
        await Promise.all(trafficData.map((item: IFinalTicketTest) => {
            delete item.score;
            delete item.reasons;
        })); 
        let result = await prefer.markScoreProcess(trafficData);
        await Promise.all(result.map(async (item: IFinalTicketTest, index: number) => {
            if(notPlaneIndex.indexOf(item.index) > -1){
                assert.equal(item.score, initScore);
            }          
        }));
    });

})