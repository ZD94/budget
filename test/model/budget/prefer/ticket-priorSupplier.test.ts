'use strict';
import assert = require("assert");
import TicketPriorSupplier = require('../../../../model/budget/prefer/ticket-priorSupplier');
import { IFinalTicket, ETrainSeat } from '../../../../model/budget/prefer/interface';
import {IFinalTicketTest} from "./ticket-refusedPlane.test";

const trafficData = require("./traffic-data.json");
const fs = require("fs")
// fs.writeFileSync("./file.json", JSON.stringify(result), 'utf-8');
const baseScore = 5000;
const priorSuppliers = ['CA', 'MU'];
const dataLength = 410;
const initScore = 0;
var result;
var subResult;


describe("ticket-PriorSupplier", async () => {
    before(async () => {   
        await Promise.all(trafficData.map((item: IFinalTicketTest) => {
            delete item.score;
            delete item.reasons;
        })); 

        var prefer = new TicketPriorSupplier("ticket-priorSupplier", {
            priorSuppliers,
            score: baseScore
        });
        result = await prefer.markScoreProcess(trafficData);
        // fs.writeFileSync("./file-duration.json", JSON.stringify(result), 'utf-8');
    })


    it("数据长度 should be ok", async () => {
        assert.equal(result.length, dataLength);
    })

    

    it(`交通类型是火车 should be ok should be ok`, async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([382].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            }
        }));
    })
    
   
    it("第174项 不在优选供应商列表中的航班 should be ok", async () => {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([174].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            } 
        }))
    })

    it("第113项 在优选供应商列表中的航班 should be ok", async () => {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([113].indexOf(item.index) >= 0) {
                assert.equal(item.score, baseScore);
            } 
        }))
    })
    //第266项航班号不存在
    it("第266项 航班号不存在 should be ok should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([266].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            }
            
        }));
    })
    //修改248的航班号
    it("第248项 航班号存在但长度小于2字符 should be ok should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([248].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            }
        }));
    })

    describe(`初始化参数permitSuppliers不存在`, async () => {
        before( async () => {
            await Promise.all(trafficData.map((item: IFinalTicketTest) => {
                delete item.score;
                delete item.reasons;
            })); 
    
            var prefer2 = new TicketPriorSupplier("ticket-priorSupplier", {
                score: baseScore
            });
            subResult = await prefer2.markScoreProcess(trafficData);
            // fs.writeFileSync("./file-directive1.json", JSON.stringify(subResult), 'utf-8');
        
        })
        it(`偏好优选供应商列表不存在, 不打分 should be ok `, async()=> {
            await Promise.all(await subResult.map((item: IFinalTicketTest, index: number) => {
                if([110].indexOf(item.index) >= 0) {
                    assert.equal(item.score, initScore);
                }
            }));
        })
    });
});



