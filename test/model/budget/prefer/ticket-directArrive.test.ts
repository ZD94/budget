'use strict';
import assert = require("assert");
import TicketDirectArrive = require('../../../../model/budget/prefer/ticket-directArrive');
import { IFinalTicket, ETrainSeat } from '../../../../model/budget/prefer/interface';
import {IFinalTicketTest} from "./ticket-refusedPlane.test";

const trafficData = require("./traffic-data.json");
// const fs = require("fs")
// fs.writeFileSync("./file.json", JSON.stringify(result), 'utf-8');
const baseScore = 5000;
const maxDuration = 300;
const minDuration = 100;
const subScore = -100;
const dataLength = 410;
const rate = 1.05;
const initScore = 0;
var result;
var subResult;


describe("ticket-directArrive", async () => {

    before(async () => {   
        await Promise.all(trafficData.map((item: IFinalTicketTest) => {
            delete item.score;
            delete item.reasons;
        })); 

        var prefer = new TicketDirectArrive("ticketDirectArrive", {
            baseScore,
            rate
        });
        result = await prefer.markScoreProcess(trafficData);
        // fs.writeFileSync("./file-directive.json", JSON.stringify(result), 'utf-8');
    
    })


    it("数据长度 should be ok", async () => {
        assert.equal(result.length, dataLength);
    })

    it(`第94、133项 飞机直达 should be ok should be ok`, async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([94, 133].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            }
        }));
    })

    it(`第118、124项，交通类型是火车 should be ok should be ok`, async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([118, 124].indexOf(item.index) >= 0) {
                assert.equal(item.score, 0);
            }
        }));
    })
    
   
    it("第109项 存在一次中转飞机 should be ok", async () => {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([109].indexOf(item.index) >= 0) {
                assert.equal(item.score, -250);
            } 
        }))
    })

    it("存在二次中转飞机 should be ok should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([141, 207].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            }
            
        }));
    })


    describe(`初始化参数baseScore`, async () => {
        before( async () => {
            await Promise.all(trafficData.map((item: IFinalTicketTest) => {
                delete item.score;
                delete item.reasons;
            })); 
    
            var prefer = new TicketDirectArrive("ticketDirectArrive", {
                baseScore,
                rate
            });
            subResult = await prefer.markScoreProcess(trafficData);
            // fs.writeFileSync("./file-directive1.json", JSON.stringify(subResult), 'utf-8');
        
        })
        it("初始化参数baseScore不存在, 加0分 should be ok should be ok", async()=> {
            await Promise.all(await subResult.map((item: IFinalTicketTest, index: number) => {
                if([94, 133].indexOf(item.index) >= 0) {
                    assert.equal(item.score, initScore);
                }
            }));
        })
        it("第109项 存在一次中转飞机 减250 should be ok", async () => {
            await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
                if([109].indexOf(item.index) >= 0) {
                    assert.equal(item.score, -250);
                } 
            }))
        })
    });

    describe(`初始化参数rate不存在`, async () => {
        before( async () => {
            await Promise.all(trafficData.map((item: IFinalTicketTest) => {
                delete item.score;
                delete item.reasons;
            })); 
    
            var prefer = new TicketDirectArrive("ticketDirectArrive", {
                baseScore
            });
            subResult = await prefer.markScoreProcess(trafficData);
            // fs.writeFileSync("./file-directive2.json", JSON.stringify(subResult), 'utf-8');
        
        }) 

        it("初始化参数rate不存在, 加0分 should be ok should be ok", async()=> {
            await Promise.all(await subResult.map((item: IFinalTicketTest, index: number) => {
                if([94, 133].indexOf(item.index) >= 0) {
                    assert.equal(item.score, initScore);
                }
            }));
        })
        it("第109项 存在一次中转飞机 减250 should be ok", async () => {
            await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
                if([109].indexOf(item.index) >= 0) {
                    assert.equal(item.score, -250);
                } 
            }))
        })
    });
     
});



