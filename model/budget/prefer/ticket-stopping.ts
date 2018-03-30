/*
* 飞机经停信息打分
* */
'use strict'
import {IFinalTicket, ETrafficType} from "./interface";
import {AbstractPrefer} from "./index";

class StopsPrefer extends AbstractPrefer<IFinalTicket> {

    private baseScore: number;
    private rate: number;

    constructor(name, options) {
        super(name, options)
        this.baseScore = options.baseScore || 20000;
        this.rate = options.rate || 1.05;
    }

    async markScoreProcess(data: IFinalTicket[]): Promise<IFinalTicket[]> {
        let self = this;
        data = data.map((v) => {
            if (!v.score) v.score = 0;
            if (!v.reasons) v.reasons = [];

            if (v.segs && v.segs.length) {
                for (let item of v.segs) {
                    if (item.stops && item.stops.length) {
                        let l = item.stops.length;
                        if (l > 0) {
                            let score = self.baseScore * (1 - l * self.rate);
                            score = Math.round(score);
                            v.score += score;
                            v.reasons.push(`需经过${l}次经停：${score}`);
                        }
                    }
                }
            }
            return v
        });
        return data
    }

}

export = StopsPrefer