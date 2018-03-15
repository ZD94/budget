/**
 * Created by wlh on 2018/3/8.
 */
'use strict';
import assert = require("assert");
import TicketCompareTrainPlanPrice = require('../../../../model/budget/prefer/ticket-compareTrainPlanPrice');
import { IFinalTicket, ETrainSeat } from '../../../../model/budget/prefer/interface';
import {IFinalTicketTest} from "./ticket-refusedPlane.test"
const trafficData = require("./traffic-data.json");

const finalScore = -5000;
const initScore = 0;
const dataLength = 410;

const fs = require("fs")
// fs.writeFileSync("./file.json", JSON.stringify(result), 'utf-8');

describe("traffic-compareTrainPlanePrice", async () => {

    it("data length should be ok", async () => {
        assert.equal(dataLength, trafficData.length);
    })
  
    it("compare-train-plane-price-M should be ok", async()=> {
        const prefer = new TicketCompareTrainPlanPrice('compareTrainPlanePrice', {
            score: finalScore,
            policies: {
                domestic: {
                    trainSeat: [ETrainSeat.FIRST_SEAT, ETrainSeat.HARD_SEAT, ETrainSeat.SECOND_SEAT]
                }
            },
            M: '50%' 
        });
        await Promise.all(trafficData.map((item: IFinalTicketTest) => {
            delete item.score;
            delete item.reasons;
        })); 
        let result = await prefer.markScoreProcess(trafficData);    

        await Promise.all(result.map(async (item: IFinalTicketTest, index: number) => {
            if([41, 235].indexOf(item.index) >= 0){
                assert.equal(item.score, finalScore);
            }  
            if([164, 213].indexOf(item.index) >= 0){
                assert.equal(item.reasons.length, 0);
            }
        })); 
    })
    
    it("compare-train-plane-price-N should be ok", async()=> {
        const prefer2 = new TicketCompareTrainPlanPrice('ticketRefusedPlanePrefer', {
            score: finalScore,
            policies: {
                domestic: {
                    trainSeat: [ETrainSeat.FIRST_SEAT, ETrainSeat.HARD_SEAT, ETrainSeat.SECOND_SEAT]
                }
            },
            N: 50
        });
        await Promise.all(trafficData.map((item: IFinalTicketTest) => {
            delete item.score;
            delete item.reasons;
        })); 
        let result = await prefer2.markScoreProcess(trafficData);
       
        await Promise.all(result.map(async (item: IFinalTicketTest, index: number) => {
            if([114, 138].indexOf(item.index) >= 0){
                assert.equal(item.score, finalScore);
            }     
            if([57, 160].indexOf(item.index) >= 0){
                assert.equal(item.reasons.length, initScore);
            }     
        }));
    });
    
    it("compare-train-plane-price-no-trainseat should be ok", async()=> {
        const prefer3 = new TicketCompareTrainPlanPrice('ticketRefusedPlanePrefer', {
            score: finalScore,
            policies: {
                domestic: {
                    star: [4]
                }
            },
            M: '50%'
        });
        await Promise.all(trafficData.map((item: IFinalTicketTest) => {
            delete item.score;
            delete item.reasons;
        })); 
        let result = await prefer3.markScoreProcess(trafficData);
        
        await Promise.all(result.map(async (item: IFinalTicketTest, index: number) => {
            if([34, 265].indexOf(item.index) >= 0 ){
                assert.equal(item.score, finalScore);
            }    
            
            if([110, 239].indexOf(item.index) >= 0 ){
                assert.equal(item.reasons.length, initScore);
            }  
        }));
    });

    it("compare-train-plane-price-N-no-trainseat should be ok", async()=> {
        const prefer4 = new TicketCompareTrainPlanPrice('ticketRefusedPlanePrefer', {
            score: finalScore,
            policies: {
                domestic: {
                    star: [4]
                }
            },
            N: 50
        });
        await Promise.all(trafficData.map((item: IFinalTicketTest) => {
            delete item.score;
            delete item.reasons;
        })); 
        let result = await prefer4.markScoreProcess(trafficData);
        await Promise.all(result.map(async (item: IFinalTicketTest, index: number) => {
            if([40, 236].indexOf(item.index) >= 0){
                assert.equal(item.score, finalScore);
            }   
            if([51,235].indexOf(item.index) >= 0){
                assert.equal(item.reasons.length, initScore);
            }          
        }));
    });

})