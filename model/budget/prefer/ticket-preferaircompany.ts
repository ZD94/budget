/*
 * @Author: Mr.He 
 * @Date: 2018-02-26 17:32:21 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-03-13 16:01:27
 * @content 指定航空公司打分. */



import { IFinalTicket, ETrafficType } from './interface';
import { AbstractPrefer } from './AbstractPrefer';


class PreferredAirlinesPrefer extends AbstractPrefer<IFinalTicket> {
 
    private score: number;
    private cheapSuppliers: Array<{code: string, name:string}>;

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
            if (!v['score']) v['score'] = 0;
            if (!v['reasons']) v['reasons'] = [];
            let supplier = "";
            if(v.type == ETrafficType.PLANE && v.No && v.No.length > 2){
                supplier = v.No.substr(0,2);
            }
            let result = false, target;
            if(self.cheapSuppliers) {
                for (let item of self.cheapSuppliers) {
                    if (v.type == ETrafficType.PLANE && supplier.length > 0  && (item.code == supplier || item.name == v['carry'])) {
                        result = true;
                        target = item;
                        break;
                    }
                }
            }   
            if (result) {
                v.score += self.score;
                v.reasons.push(`期望航空公司:${target.name}, ${target.code} +${self.score}`);
            } else {
                v.reasons.push(`期望航空公司 0`)
            }
            return v;
        });
        return tickets;
    }
}

export = PreferredAirlinesPrefer;

// function preferaircompany(data: IFinalTicket[], airCompanies: { name: string, code: string }[], score: number): IFinalTicket[] {

//     data = data.map((v) => {
//         if (!v['score']) v['score'] = 0;
//         if (!v.reasons) v.reasons = [];

//         let result = false, target;
//         for (let item of airCompanies) {
//             if (v['carry'] && v.type == ETrafficType.PLANE && (item.name == v['carry'] || item.code == v['carry'])) {
//                 result = true;
//                 target = item;
//                 break;
//             }
//         }
//         if (result) {
//             v.score += score;
//             v.reasons.push(`期望航空公司:${target.name}, ${target.code} +${score}`);
//         } else {
//             v.reasons.push(`期望航空公司 0`)
//         }
//         return v;
//     });
//     return data;
// }

// export = preferaircompany;