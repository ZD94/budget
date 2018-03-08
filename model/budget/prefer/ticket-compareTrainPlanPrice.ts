/**
 * Created by hxs on 17/8/11.
 */


'use strict';
import {IFinalTicket,  ETrafficType} from "./interface";
import {AbstractPrefer} from "./index";


class compareTrainPlanPrice extends AbstractPrefer<(IFinalTicket)> {
    private score: number;
    private policies : any;
    private options : any;

    constructor(name: string, options: any) {
        super(name, options);
        if (!this.score) {
            this.score = 0;
        }
        this.policies = options.policies;
        this.options = options;
    }

    async markScoreProcess(data: (IFinalTicket)[]): Promise<(IFinalTicket)[]> {
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
        
        let planPrice = 0;
        if(this.options.M){
            let percent = this.options.M.replace(/\%/ig, "") / 100;
            planPrice = trainBasePrice * (1 + percent);
        }else if(this.options.N){
            planPrice = this.options.N + trainBasePrice;
        }

        for(let item of data){
            if(item.type == ETrafficType.PLANE && item.price <= planPrice){
                item.score = item.score || 0;
                item.score += this.options.score;
                item.reasons.push("机票价低于火车基准价 80000");
            }
        }

        return data;
    }
}

export= compareTrainPlanPrice;