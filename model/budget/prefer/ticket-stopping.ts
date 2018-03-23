/*
* 飞机经停信息打分
* */
'use strict'
import {IFinalTicket, ETrafficType} from "./interface";
import {AbstractPrefer} from "./index";

class StoppingPrefer extends AbstractPrefer<IFinalTicket> {

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
            for (let item of v.segs) {
                if (item.fsitem && item.fsitem.length) {
                    let l = item.fsitem.length
                    if (l > 1) {

                    }
                }
            }
            return v
        })
        return data
    }

}

export = StoppingPrefer