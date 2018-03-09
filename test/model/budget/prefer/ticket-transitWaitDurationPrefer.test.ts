'use strict';
import assert = require("assert");
import TicketTransitWaitDuration = require('../../../../model/budget/prefer/ticket-transitWaitDurationPrefer');
import { IFinalTicket, ETrainSeat } from '../../../../model/budget/prefer/interface';
import {IFinalTicketTest} from "./ticket-refusedPlane.test"
const trafficData = require("./traffic-data.json");

const fs = require("fs")
// fs.writeFileSync("./file.json", JSON.stringify(result), 'utf-8');

const baseScore = 5000;
const maxDuration = 300;
const minDuration = 60;
const subScore = -100;
var prefer = null;

describe("ticket-transitWaitDurationPrefer", async () => {

    beforeEach(async () => {
        await Promise.all(trafficData.map((item: IFinalTicketTest) => {
            delete item.score;
            delete item.reasons;
        })); 

        prefer = new TicketTransitWaitDuration("transitWaitDuration", {
            maxDuration,
            minDuration,
            baseScore,
            subScore
        });
    })
    
    let result = await prefer.markScoreProcess(trafficData);
    fs.writeFileSync("./file-duration.json", JSON.stringify(result), 'utf-8');

    it("存在中转飞机 should be ok", async () => {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([].indexOf(item.index) >= 0) {
                assert.equal(item.score, 0);
            } 
        }))
    })

    it("直达飞机 should be ok should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([].indexOf(item.index) >= 0) {
                assert.equal(item.score, 0);
            }
            
        }));
    })

    it("乘坐火车 should be ok should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([].indexOf(item.index) >= 0) {
                assert.equal(item.score, 0);
            }
        }));
    })

    it("中转时长超过最大偏好值300min should be ok should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([].indexOf(item.index) >= 0) {
                assert.equal(item.score, 0);
            }
        }));
    })

    it("中转时长小于最小偏好值300min should be ok should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([].indexOf(item.index) >= 0) {
                assert.equal(item.score, 0);
            }
        }));
    })

    it("中转时长满足偏好值范围50-300min should be ok should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([].indexOf(item.index) >= 0) {
                assert.equal(item.score, 0);
            }
        }));
    })
});



