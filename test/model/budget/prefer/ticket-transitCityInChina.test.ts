'use strict';
import assert = require("assert");
import TicketTransitCityInChina = require('../../../../model/budget/prefer/ticket-transitCityInChinaPrefer');
import { IFinalTicket, ETrainSeat } from '../../../../model/budget/prefer/interface';
import {IFinalTicketTest} from "./ticket-refusedPlane.test"
const trafficData = require("./traffic-data.json");

const fs = require("fs")
// fs.writeFileSync("./file.json", JSON.stringify(result), 'utf-8');

describe("ticket-transitCityInChina", async () => {
    const prefer = new TicketTransitCityInChina("transitCityInChina", {
        baseScore: 5000
    });
    await Promise.all(trafficData.map((item: IFinalTicketTest) => {
        delete item.score;
        delete item.reasons;
    })); 
    let result = prefer.markScoreProcess(trafficData);

    it("multi-trips-contain-one-in-china should be ok", async () => {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            assert.equal(item.score, 0);
        }))
    })

    it("single-trip should be ok should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            assert.equal(item.score, 0);
        }));
    })

    it("multi-trips-oversea should be ok should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            assert.equal(item.score, 0);
        }));
    })

});



