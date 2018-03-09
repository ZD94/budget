/*
 * @Author: Mr.He 
 * @Date: 2018-02-26 17:32:21 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-03-09 16:10:53
 * @content 指定航空公司打分. */



import { IFinalTicket, ETrafficType } from './interface';

function preferaircompany(data: IFinalTicket[], airCompanies: { name: string, code: string }[], score: number): IFinalTicket[] {

    data = data.map((v) => {
        if (!v['score']) v['score'] = 0;
        if (!v.reasons) v.reasons = [];

        let result = false, target;
        for (let item of airCompanies) {
            if (v['carry'] && v.type == ETrafficType.PLANE && (item.name == v['carry'] || item.code == v['carry'])) {
                result = true;
                target = item;
                break;
            }
        }
        if (result) {
            v.score += score;
            v.reasons.push(`期望航空公司:${target.name}, ${target.code} +${score}`);
        } else {
            v.reasons.push(`期望航空公司 0`)
        }
        return v;
    });
    return data;
}

export = preferaircompany;