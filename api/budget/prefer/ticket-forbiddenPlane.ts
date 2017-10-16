/**
 * Created by wyl on 16/9/21.
 */

'use strict';
import {IFinalTicket, IFinalHotel, ETrafficType} from "_types/budget";
import {AbstractPrefer} from "./index";


class ForbiddenPlanePrefer extends AbstractPrefer<(IFinalHotel|IFinalTicket)> {
    private score: number;
    private percent: number;

    constructor(name: string, options: any) {
        super(name, options);
        if (!this.score) {
            this.score = 0;
        }
    }

    async markScoreProcess(data: (IFinalHotel|IFinalTicket)[]): Promise<(IFinalHotel|IFinalTicket)[]> {
        if (!data.length) return data;
        let self = this;
        let score = self.score;
        data = data.map( function(v:(IFinalHotel|IFinalTicket)){
            if (!v.reasons) v.reasons = [];
            if (!v.score) v.score = 0;

            if (v['type'] == ETrafficType.PLANE) {
                v.score += score;
                v.reasons.push(`禁止乘坐飞机打分`);
            }
            return v;
        })
        return data;
    }
}

export= ForbiddenPlanePrefer;