'use strict';
import assert = require("assert");
import TicketPreferredAirlinesPrefer = require('../../../../model/budget/prefer/ticket-preferaircompany');
import { IFinalTicket, ETrainSeat } from '../../../../model/budget/prefer/interface';
import {IFinalTicketTest} from "./ticket-refusedPlane.test";
const trafficData = require("./traffic-data.json");
const baseScore = 5000;
const dataLength = 410;
const initScore = 0;
const airCompanies = [{
    name: '东方航空',
    code: 'MU'
}]
var result;
var subResult;

describe('TicketPreferredAirlinesPrefer', async () => {
    before(async () => {   
        await Promise.all(trafficData.map((item: IFinalTicketTest) => {
            delete item.score;
            delete item.reasons;
        })); 

        const prefer = new TicketPreferredAirlinesPrefer('TicketPreferredAirlinesPrefer', { 
            cheapSuppliers: airCompanies, 
            score: baseScore
        })
        result = await prefer.markScoreProcess(trafficData);

    })

    it("数据长度 should be ok", async () => {
        assert.equal(result.length, dataLength);
    })


    it(`第382项 交通类型是火车 打0分 should be ok`, async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([382].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            }
        }));
    })
    
   
    it("第174项 不在优选供应商列表中的航班 打0分 should be ok", async () => {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([174].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            } 
        }))
    })

    it("第113项 在优选供应商列表中的航班 打5000分 should be ok", async () => {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([113].indexOf(item.index) >= 0) {
                assert.equal(item.score, baseScore);
            } 
        }))
    })
    //第266项航班号不存在
    it("第266项 航班号不存在 打0分 should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([266].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            }
            
        }));
    })
    //修改248的航班号
    it("第248项 航班号存在但长度小于2字符 打0分 should be ok", async()=> {
        await Promise.all(await result.map((item: IFinalTicketTest, index: number) => {
            if([248].indexOf(item.index) >= 0) {
                assert.equal(item.score, initScore);
            }
        }));
    })

    describe(`初始化参数cheapSuppliers不存在`, async () => {
        before( async () => {
            await Promise.all(trafficData.map((item: IFinalTicketTest) => {
                delete item.score;
                delete item.reasons;
            })); 
    
            var prefer2 = new TicketPreferredAirlinesPrefer("ticket-priorSupplier", {
                score: baseScore
            });
            subResult = await prefer2.markScoreProcess(trafficData);
        })
        it(`第110项 偏好优选供应商列表不存在 打0分 should be ok`, async()=> {
            await Promise.all(await subResult.map((item: IFinalTicketTest, index: number) => {
                if([110].indexOf(item.index) >= 0) {
                    assert.equal(item.score, initScore);
                }
            }));
        })
    });


});
    



    




