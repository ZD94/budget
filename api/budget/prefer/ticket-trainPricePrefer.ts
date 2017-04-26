/**
 * Created by wyl on 16/9/20.
 */

'use strict';
import {IFinalTicket, ETrafficType} from "_types/budget";
import {AbstractPrefer} from "./index";


class TrainPricePrefer extends AbstractPrefer<IFinalTicket> {
    private score: number;

    constructor(name, options) {
        super(name, options);
        if (!this.score) {
            this.score = 0;
        }
    }

    async markScoreProcess(tickets:IFinalTicket[]):Promise<IFinalTicket[]> {
        if (!tickets.length) return tickets;
        let self = this;

        tickets = tickets.map( (v) => {
            if (!v.score) v.score = 0;
            if (!v.reasons) v.reasons = [];
            if (v.type == ETrafficType.TRAIN) {
                var addScore = v.price/v.duration*1000;
                v.score += addScore;
                v.reasons.push(`火车价格打分 ${addScore}`)
            } else {
                v.reasons.push(`火车价格打分 0`)
            }
            return v;
        })
        return tickets;
    }
}

export= TrainPricePrefer