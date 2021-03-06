/**
 * Created by wlh on 16/8/10.
 */

'use strict';
import {IFinalTicket, ETrafficType} from "./interface";
import {AbstractPrefer} from "./index";
//廉价供应商

// const CHEAP_SUPPLIERS = ['春秋航空', '中国联合航空', '西部航空', '成都航空', '九元航空', '幸福航空']; //'吉祥航空',
const CHEAP_SUPPLIERS = ["9C", "KN", "PN", "EU", "AQ", "JR"];  // "HO",
class CheapSupplierPrefer extends AbstractPrefer<IFinalTicket> {

    private score: number;
    private cheapSuppliers: string[];

    constructor(name, options) {
        super(name, options);
        if (!this.score) {
            this.score = 0;
        }
        if (!this.cheapSuppliers) {  //|| !(this.cheapSuppliers.length)
            this.cheapSuppliers = CHEAP_SUPPLIERS;
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
            if (v.type == ETrafficType.PLANE && supplier.length > 0 && self.cheapSuppliers.indexOf(supplier) >= 0) {
                v['score'] += self.score;
                v['reasons'].push(`不允许乘坐廉价供应商 ${self.score}`)
            } else {
                v.reasons.push(`不允许乘坐廉价供应商： 0`)
            }
            return v;
        });
        return tickets;
    }
}

export= CheapSupplierPrefer