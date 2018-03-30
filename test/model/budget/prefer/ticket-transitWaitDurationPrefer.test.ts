'use strict';
import assert = require("assert");
import TicketTransitWaitDuration = require('../../../../model/budget/prefer/ticket-transitWaitDurationPrefer');
import { IFinalTicket, ETrainSeat } from '../../../../model/budget/prefer/interface';
import {IFinalTicketTest} from "./ticket-refusedPlane.test"
const trafficData = require("./traffic-data.json");

// const fs = require("fs")
// fs.writeFileSync("./file.json", JSON.stringify(result), 'utf-8');

const baseScore = 5000;
const maxDuration = 300;
const minDuration = 100;
const subScore = -100;
const dataLength = 410;

const initScore = 0;
// var prefer;
var result;

describe("ticket-transitWaitDurationPrefer", async () => {

    before(async () => {   
        await Promise.all(trafficData.map((item: IFinalTicketTest) => {
            delete item.score;
            delete item.reasons;
        })); 

        var prefer = new TicketTransitWaitDuration("transitWaitDuration", {
            maxDuration,
            minDuration,
            baseScore,
            subScore
        });
        result = await prefer.markScoreProcess(trafficData);
    })


    it("交通数据长度 should be ok", async () => {
        assert.equal(result.length, dataLength);
    })

    it("第141、207项 满足直达飞机 打0分 should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([141, 207].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            }
            
        }));
    })

    it("第105、136项 乘坐火车 打0分should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([105, 136].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            }
        }));
    })
    //index=108, 等待时长为 685min
    it(`第108项 中转等待时长超过最大偏好值${maxDuration}min should be ok should be ok`, async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([108].indexOf(item.index) >= 0) {
                assert.equal(item.score, 43500);
            }
        }));
    })

    //index=97, 等待时长为 55min
    it(`第97项 中转等待时长小于最小偏好值${minDuration}min should be ok should be ok`, async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([97].indexOf(item.index) >= 0) {
                assert.equal(item.score, 8500);
            }
        }));
    })
    //index=109, 等待时长为 175min
    it(`第109项 中转等待时长满足偏好值范围${minDuration}-${maxDuration}min should be ok should be ok`, async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([109].indexOf(item.index) >= 0) {
                assert.equal(item.score, 5000);
            }
        }));
    })
});



