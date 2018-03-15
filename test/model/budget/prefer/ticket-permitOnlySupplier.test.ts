'use strict';
import assert = require("assert");
import TicketPermitOnlySupplier = require('../../../../model/budget/prefer/ticket-permitOnlySupplier');
import { IFinalTicket, ETrainSeat } from '../../../../model/budget/prefer/interface';
import {IFinalTicketTest} from "./ticket-refusedPlane.test";

const trafficData = require("./traffic-data.json");
const fs = require("fs")
// fs.writeFileSync("./file.json", JSON.stringify(result), 'utf-8');
const baseScore = -5000;
const dataLength = 410;
const rate = 1.05;
const initScore = 0;
var result;


describe("ticket-PermitOnlySupplier", async () => {

    beforeEach(async () => {   
        await Promise.all(trafficData.map((item: IFinalTicketTest) => {
            delete item.score;
            delete item.reasons;
        })); 

        var prefer = new TicketPermitOnlySupplier("ticketPermitOnlySupplier", {
            score: baseScore,
            permitSuppliers: ['CA', 'MU', 'ZH']
        });
        result = await prefer.markScoreProcess(trafficData);
        // fs.writeFileSync("./file-permit.json", JSON.stringify(result), 'utf-8');
    })


    it("数据长度 should be ok", async () => {
        assert.equal(result.length, dataLength);
    })

    it(`第97项 交通类型是火车,打0分 should be ok should be ok`, async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([97].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            }
        }));
    })
    
    //删除航班号 266
    it("第266项 航班号不存在, 不打分 should be ok", async () => {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([266].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            } 
        }))
    })
    //248项修改航班号低于2个字符
    it("第248项 航班号存在且小于2个字符，应该不打分 should be ok should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([248].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            }
            
        }));
    })

    it("第114、173项 允许乘坐的航空公司的航班, 打0分 should be ok should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([114, 173].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            }
        }));
    })
    
    it(`第137、138项 不允许乘坐的航空公司的航班, 打0分 should be ok should be ok`, async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([137, 148].indexOf(item.index) >= 0) {
                assert.equal(item.score, baseScore);
            }
        }));
    })  
});



