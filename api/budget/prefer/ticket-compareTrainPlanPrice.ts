/**
 * Created by hxs on 17/8/11.
 */


'use strict';
import {IFinalTicket, IFinalHotel, ETrafficType} from "_types/budget";
import {AbstractPrefer} from "./index";


class compareTrainPlanPrice extends AbstractPrefer<(IFinalHotel|IFinalTicket)> {
    private score: number;
    private percent: number;
    private level: number[];
    private type: string;

    constructor(name: string, options: any) {
        super(name, options);
        if (!this.score) {
            this.score = 0;
        }
        this.policies = options.policies;
        this.options = options;

        console.log("compareTrainPlanPrice === > constructor ");

    }

    async markScoreProcess(data: (IFinalHotel|IFinalTicket)[]): Promise<(IFinalHotel|IFinalTicket)[]> {
        if (!data.length) return data;
        let self = this;
        let trainSeat; 
        try{
            trainSeat = this.policies.domestic.trainSeat;
        }catch(e){
            trainSeat = [2];
        }

        //计算火车基准价格
        let trainBasePrice = 0;
        for(let item of data){
            if(item.type == ETrafficType.TRAIN && trainSeat.indexOf(item.cabin) > -1 && item.price > trainBasePrice){
                trainBasePrice = item.price;
            }
        }

        console.log("计算火车基准价格===>", trainBasePrice);
        
        let planPrice = 0;
        if(this.options.M){
            let percent = this.options.M.replace(/\%/ig, "") / 100;
            planPrice = trainBasePrice * (1 + percent);
        }else if(this.options.N){
            planPrice = this.options.N + trainBasePrice;
        }

        console.log("飞机基准价=====>", planPrice);

        for(let item of data){
            if(item.type == ETrafficType.PLANE && item.price <= planPrice){
                item.score = item.score || 0;
                item.score += this.options.score;
            }
        }

        return data;
    }
}

export= compareTrainPlanPrice;