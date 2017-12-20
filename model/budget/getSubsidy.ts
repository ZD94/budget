/*
 * @Author: Mr.He 
 * @Date: 2017-12-20 10:11:47 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2017-12-20 11:55:56
 * @content what is the content of this file. 
 * */

import { TravelPolicy, ForbiddenPlane, EPlaneLevel } from "_types/policy";
import { Models } from "_types/index";
import { ICity, CityService } from '_types/city';
import { EBudgetType } from "_types/budget";


export interface GetSubsidyItemParam {
    companyId: string;
    travelPolicyId: string;
    city: ICity;
    beginTime: Date;
    endTime: Date;
    days: number;     //天数
    preferedCurrency: string;  //货币类型
}
export var defaultCurrencyUnit = 'CNY';

export class GetSubsidy {
    async getSubsidyItem(params: GetSubsidyItemParam) {
        let { companyId, travelPolicyId, city, beginTime, endTime, days = 1, preferedCurrency } = params;
        let tp: TravelPolicy;
        tp = await Models.travelPolicy.get(travelPolicyId);
        if (!tp) {
            throw new Error("getSubsidyItem， not found travelPolicy");
        }
        let timezone = city ? (city.timezone || 'Asia/Shanghai') : 'Asia/Shanghai';

        let company = await Models.company.get(tp.companyId);
        let subsidies = await tp.getSubsidies({ placeId: city.id });


        let templates = [], totalMoney = 0;
        for (let i = 0; i < subsidies.length; i++) {
            let subsidyDay = Math.floor(days / subsidies[i].subsidyType.period);
            let price = subsidies[i].subsidyMoney * subsidyDay;
            totalMoney += price;
            let subsidy = {
                name: subsidies[i].subsidyType.name, period: subsidies[i].subsidyType.period,
                money: subsidies[i].subsidyMoney, price: price, id: subsidies[i].id, subsidyType: subsidies[i].subsidyType
            };
            if (subsidyDay) {
                templates.push(subsidy);
            }
        }


        let budget: any = {};
        budget.unit = preferedCurrency && typeof (preferedCurrency) != 'undefined' ? preferedCurrency : defaultCurrencyUnit;
        budget.fromDate = beginTime;
        budget.endDate = endTime;
        budget.price = totalMoney;
        budget.duringDays = days;
        budget.templates = templates;
        budget.type = EBudgetType.SUBSIDY;
        budget.timezone = timezone;

        //汇率后期应该统一处理
        if (preferedCurrency == defaultCurrencyUnit) {
            budget.rate = 1;
        } else {
            let rates = await Models.currencyRate.find({ where: { currencyTo: preferedCurrency }, order: [["postedAt", "desc"]] });
            if (rates && rates.length) {
                budget.rate = rates[0].rate;
            } else {
                budget.rate = 1;
            }
        }

        return budget;
    }
}


let getSubsidy = new GetSubsidy();
export default getSubsidy;