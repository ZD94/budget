'use strict';
import {IFinalTicket, ETrafficType} from "_types/budget";
import {AbstractPrefer} from "./index";

class RefusedPlanePrefer extends AbstractPrefer<IFinalTicket> {
    private score: number;

    constructor(public name: string, options: any) {
        super(name, options);
        if (!this.score) {
            this.score = 0;
        }
    }
    async markScoreProcess(tickets: IFinalTicket[]) : Promise<IFinalTicket[]> {
        let self = this;

        tickets = tickets.map( (v) => {
            if (!v['score']) v['score'] = 0;
            if (!v.reasons) v['reasons'] = [];
            if (v.type == ETrafficType.PLANE) {
                v['score'] += self.score;
                v.reasons.push(`不乘坐飞机 ${self.score}`);
            }
            return v;
        })
        return tickets;
    }
}

export= RefusedPlanePrefer;