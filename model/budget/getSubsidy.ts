/*
 * @Author: Mr.He 
 * @Date: 2017-12-20 10:11:47 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-01-19 17:18:25
 * @content what is the content of this file. 
 * */

import { TravelPolicy, ForbiddenPlane, EPlaneLevel } from "_types/policy";
import { Models } from "_types/index";
import { ICity, CityService } from '_types/city';
import { EBudgetType } from "_types/budget";
import { SearchSubsidyParams } from "./interface";

export class GetSubsidy {
    async getSubsidyItem(companyId: string, travelPolicyId: string, params: SearchSubsidyParams) {
        let { city, beginTime, endTime, days = 1 } = params;
        let tp: TravelPolicy;
        tp = await Models.travelPolicy.get(travelPolicyId);
        if (!tp) {
            throw new Error("getSubsidyItem， not found travelPolicy");
        }

        if (typeof city == "string") {
            city = await CityService.getCity(city);
        }
        let timezone = city ? (city.timezone || 'Asia/Shanghai') : 'Asia/Shanghai';

        let company = await Models.company.get(tp.companyId);
        let subsidies = await tp.getSubsidies({ placeId: city.id }) || [];
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
        budget.fromDate = beginTime;
        budget.endDate = endTime;
        budget.price = totalMoney;
        budget.duringDays = days;
        budget.templates = templates;
        budget.type = EBudgetType.SUBSIDY;
        budget.timezone = timezone;

        return budget;
    }
}


let getSubsidy = new GetSubsidy();
export default getSubsidy;



// setTimeout(async () => {
//     /* let result = await getSubsidy.getSubsidyItem({
//         companyId: "e3e7e690-1b7c-11e7-a571-7fedc950bceb",
//         travelPolicyId: "ae6e7050-af2a-11e7-abf6-9f811e5a6ff9",
//         city: "CT_179",
//         beginTime: "2018-01-22",
//         endTime: "2018-01-24",
//         days: 2     //天数
//     }); */


//     console.log(123, JSON.stringify(result));
// }, 8000);