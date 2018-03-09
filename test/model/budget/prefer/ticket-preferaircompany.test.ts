'use strict';
import assert = require("assert");
import TicketPreferAirCompany = require('../../../../model/budget/prefer/ticket-preferaircompany');
import { IFinalTicket, ETrainSeat } from '../../../../model/budget/prefer/interface';
import {IFinalTicketTest} from "./ticket-refusedPlane.test";
const trafficData = require("./traffic-data.json");
const baseScore = 5000;
const priorSuppliers = ['CA', 'MU'];
const dataLength = 410;
const initScore = 0;
const airCompanies = [{
    name: '东方航空',
    code: '东航'
}]
var result;
var subResult;


describe("ticket-preaircompany", async () => {
    before(async () => {   
        await Promise.all(trafficData.map((item: IFinalTicketTest) => {
            delete item.score;
            delete item.reasons;
        })); 

        result = TicketPreferAirCompany(trafficData, airCompanies, baseScore)
    })

    it("数据长度 should be ok", async () => {
        assert.equal(result.length, dataLength);
    })

    it(`满足期望航空公司 should be ok should be ok`, async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([113].indexOf(item.index) >= 0) {
                assert.equal(item.score, baseScore);
            }
        }));
    })

    it("不满足期望航空公司 should be ok", async () => {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([108].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            } 
        }))
    })
});



