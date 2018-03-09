'use strict';
import assert = require("assert");
import TicketPlaneNumberPrefer = require('../../../../model/budget/prefer/ticket-planeNumberPrefer');
import { IFinalTicket, ETrainSeat } from '../../../../model/budget/prefer/interface';
import {IFinalTicketTest} from "./ticket-refusedPlane.test";
const trafficData = require("./traffic-data.json");
const baseScore = 5000;
const priorSuppliers = ['CA', 'MU'];
const dataLength = 410;
const initScore = 0;
const percent = 0.8;
var result = null;
var subResult;

const fs = require("fs")
// fs.writeFileSync("./file.json", JSON.stringify(result), 'utf-8');
const cabins = [2,3];

describe("ticket-planeNumberPrefer", async () => {
    before(async () => {   
        await Promise.all(trafficData.map((item: IFinalTicketTest) => {
            delete item.score;
            delete item.reasons;
        })); 

        let prefer = new TicketPlaneNumberPrefer('ticketPlaneNumberPrefer', {
            cabins,
            score: baseScore,
            percent
        })
        result = await prefer.markScoreProcess(trafficData);
        fs.writeFileSync("./file.json", JSON.stringify(result), 'utf-8')
    })

    it("数据长度 should be ok", async () => {
        assert.equal(result.length, dataLength);
    })

    it(`位置偏好以下 should be ok`, async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([17].indexOf(item.index) >= 0) {
                assert.equal(item.score, 1079);
            }
            if([189].indexOf(item.index) >= 0) {
                assert.equal(item.score, 4984);
            }
        }));
    })

    it("位置偏好以上 should be ok", async () => {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([289].indexOf(item.index) >= 0) {
                assert.equal(item.score, -4004);
            } 
            if([265].indexOf(item.index) >= 0) {
                assert.equal(item.score, 1892);
            } 
        }))
    })


    it("位置偏好 不打分 should be ok", async () => {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([264].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            }
        }))
    })
});



