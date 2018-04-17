'use strict'
import {IFinalTicket} from './interface'
import {AbstractPrefer} from "./index"

class removeOverflowTimeWindowPrefer extends AbstractPrefer<IFinalTicket> {
    private score: number
    private desiredFromDateTime: Date;
    private desiredToDateTime: Date;

    constructor(name, options) {
        super(name, options);
        if (!this.score)
            this.score = -900000
    }

    async markScoreProcess(tickets: IFinalTicket[]): Promise<IFinalTicket[]> {
        let self = this;
        if (!tickets.length) return tickets;

        let d1 = self.desiredFromDateTime;
        let d2 = self.desiredToDateTime;
        if (!d1 || !d2) return tickets;
        if (d1 && typeof d1 == 'string') d1 = new Date(d1 as string);
        if (d2 && typeof d2 == 'string') d2 = new Date(d2 as string);

        let score = this.score;
        tickets = tickets.map((v) => {
            if (!v['score']) v['score'] = 0;
            if (!v['reasons']) v['reasons'] = [];

                if (d1 && v.departDateTime && new Date(v.departDateTime) < d1) {
                    v.score += self.score;
                    v.reasons.push(`期待出发时间${self.desiredFromDateTime},实际出发时间${v.departDateTime}，惩罚${self.score}分`)
                }

                if (d2 && v.arrivalDateTime && new Date(v.arrivalDateTime) > d2) {
                    v.score += self.score;
                    v.reasons.push(`期待到达时间${self.desiredToDateTime},实际到达时间${v.arrivalDateTime}，惩罚${self.score}分`)
                }
            return v;
        });

        return tickets
    }
}

export = removeOverflowTimeWindowPrefer