/*
 * @Author: Mr.He 
 * @Date: 2018-02-26 17:32:21 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-02-26 17:37:16
 * @content 指定航空公司打分. */



import { IFinalTicket, ETrafficType } from '_types/budget';

function preferaircompany(data: IFinalTicket[], airCompanies: { name: string, code: string }[], score: number): IFinalTicket[] {

    data = data.map((v) => {
        if (!v['score']) v['score'] = 0;
        if (!v.reasons) v.reasons = [];

        let result = false;
        for (let item of airCompanies) {
            if (v['carry'] && v.type == ETrafficType.PLANE && item.code == v['carry']) {
                result = true;
                break;
            }
        }
        if (result) {
            v.score += score;
            v.reasons.push(`期望航空公司+${score}`);
        } else {
            v.reasons.push(`期望航空公司 0`)
        }
        return v;
    });
    return data;
}

export = preferaircompany;