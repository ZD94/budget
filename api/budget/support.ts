/*
 * @Author: Mr.He 
 * @Date: 2017-12-16 11:35:17 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2017-12-16 16:54:55
 * @content what is the content of this file. */

import { ICity, CityService } from '_types/city';
import { IPolicySet, IStaff, EAirCabin } from "_types/budget";
import ApiTravelBudget from "./index";
import { getSuitablePrefer } from "api/prefer";
import { ECompanyRegionUsedType } from "_types/policy/companyRegion";
import { Models } from "_types/index";
import _ = require("lodash");
import { TravelPolicy, ForbiddenPlane, EPlaneLevel } from "_types/policy";


export interface AllPreferParams {
    fromCity: ICity | string;
    toCity: ICity | string;
    companyId: string;
    travelPolicyId: string;
    policies: IPolicySet;         //差旅政策
    staff: IStaff;
    latestArrivalTime: Date;     //最晚到达时间
    earliestDepartTime?: Date;   //最早出发时间
    preferedCurrency?: string;

    // expiredBudget?: boolean;   在前面做这个检查  参数检查也在前面做
    // isRetMarkedData?: boolean;

}





//获取一段行程 Allprefer 设置
class DealBudget {

    /* 获取交通行程所需全部打分参数 */
    static async getTrafficAllPrefer(params: AllPreferParams) {
        let { fromCity, toCity, latestArrivalTime, earliestDepartTime, companyId, travelPolicyId, staff, preferedCurrency } = params;

        if (typeof fromCity == 'string') {
            fromCity = await CityService.getCity(fromCity);
        }
        if (typeof toCity == 'string') {
            toCity = await CityService.getCity(toCity);
        }

        /* 获取公司偏好最佳配置 */
        let preferSet = await getSuitablePrefer({
            companyId,
            placeId: toCity.id
        });

        /* 交通的差旅政策 */
        let policies;
        let tp = await Models.travelPolicy.get(travelPolicyId);
        if (toCity.isAbroad) {
            policies = {
                abroad: {
                    cabin: await tp.getBestTravelPolicy({
                        placeId: toCity["id"],
                        type: "planeLevels",
                        companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                    }),
                    trafficPrefer: await tp.getBestTravelPolicy({
                        placeId: toCity["id"],
                        type: "trafficPrefer",
                        companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                    }),
                }
            }
        } else {
            policies = {
                domestic: {
                    cabin: await tp.getBestTravelPolicy({
                        placeId: toCity["id"],
                        type: "planeLevels",
                        companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                    }),
                    trainSeat: await tp.getBestTravelPolicy({
                        placeId: toCity["id"],
                        type: "trainLevels",
                        companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                    }),
                    trafficPrefer: await tp.getBestTravelPolicy({
                        placeId: toCity["id"],
                        type: "trafficPrefer",
                        companyRegionType: ECompanyRegionUsedType.TRAVEL_POLICY
                    }),
                }
            }
        }

        let dtimezone = toCity && toCity.timezone ? toCity.timezone : 'Asia/Shanghai';
        let leaveDate = moment(latestArrivalTime || earliestDepartTime).tz(dtimezone).format('YYYY-MM-DD');

        let staffPolicy = policies[staff.policy] || {};
        let trainSeat = staffPolicy.trainSeat;
        let cabin = staffPolicy.cabin;

        let isForbiddenByPlane = cabin && _.isArray(cabin) && cabin.indexOf(ForbiddenPlane) >= 0 ? true : false;
        if (isForbiddenByPlane) {
            cabin = [EAirCabin.ECONOMY];
        }
        let qs = {
            local: {
                expectTrainCabins: trainSeat,
                expectFlightCabins: cabin,
                leaveDate: leaveDate,
                earliestLeaveDateTime: earliestDepartTime,
                latestArrivalDateTime: latestArrivalTime,
            }
        }


        // let staffBudgets = await Promise.all(staffs.map(async (staff) => {
        //     let policyKey = staff.policy || 'default';
        //     let staffPolicy = policies[policyKey] || {};
        //     let trainSeat = staffPolicy.trainSeat;
        //     let cabin = staffPolicy.cabin;

        //     //若获取的飞机仓位为-1，则表示该地区禁止乘坐飞机
        //     let isForbiddenByPlane = cabin && _.isArray(cabin) && cabin.indexOf(ForbiddenPlane) >= 0 ? true : false;
        //     //若设置禁止飞机，那么会设置仓位最低的经济舱去进行打分
        //     if (isForbiddenByPlane) {
        //         cabin = [EAirCabin.ECONOMY];
        //     }
        //     // let shipCabin = staffPolicy.shipCabin;
        //     let qs = {
        //         local: {
        //             expectTrainCabins: trainSeat,
        //             expectFlightCabins: cabin,
        //             leaveDate: leaveDate,
        //             earliestLeaveDateTime: earliestDepartTime,
        //             latestArrivalDateTime: latestArrivalTime,
        //         }
        //     }

        //     let allPrefers;
        //     if ((<ICity>fromCity).isAbroad || (<ICity>toCity).isAbroad) {
        //         let key = DEFAULT_PREFER_CONFIG_TYPE.ABROAD_TRAFFIC;
        //         allPrefers = loadPrefers(preferSet["traffic"] || [], qs, key)
        //     } else {
        //         let key = DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_TICKET;
        //         allPrefers = loadPrefers(preferSet["traffic"] || [], qs, key)
        //     }
        //     //追加员工特殊偏好
        //     if (typeof staffPolicy.trafficPrefer == 'number' && staffPolicy.trafficPrefer >= 0) {
        //         [EAirCabin.BUSINESS, EAirCabin.ECONOMY, EAirCabin.FIRST, EAirCabin.PREMIUM_ECONOMY].forEach((cabin) => {
        //             let pref = {
        //                 "name": "price",
        //                 "options": { "type": "square", "score": 50000, "level": [cabin], "percent": staffPolicy.trafficPrefer / 100 }
        //             };
        //             for (let i = 0; i < allPrefers.length; i++) {
        //                 if (allPrefers[i].name == pref.name && allPrefers[i].options.level[0] == pref.options.level[0]) {
        //                     allPrefers.splice(i, 1, pref);
        //                 }
        //             }
        //         });
        //     }
        //     //追加是否允许乘坐飞机
        //     if (isForbiddenByPlane) {
        //         allPrefers.push({
        //             "name": "refusedPlane",
        //             "options": { "type": "square", "score": -1000000, "percent": 0 }
        //         })
        //     }
        //     let strategy = await TrafficBudgetStrategyFactory.getStrategy({
        //         fromCity,
        //         toCity,
        //         latestArrivalTime,
        //         earliestDepartTime,
        //         policies,
        //         prefers: allPrefers,
        //         tickets,
        //         staffs,
        //     }, { isRecord: true });

        //     let budget = await strategy.getResult(tickets, isRetMarkedData, preferedCurrency);
        //     let discount = 0;
        //     if (budget.trafficType == ETrafficType.PLANE) {
        //         let fullPrice = await API.place.getFlightFullPrice({ originPlace: budget.fromCity, destination: budget.toCity });
        //         let price = fullPrice ? (EAirCabin.ECONOMY ? fullPrice.EPrice : fullPrice.FPrice) : 0;
        //         if (price) {
        //             discount = Math.round(budget.price / price * 100) / 100
        //             discount = discount < 1 ? discount : 1;
        //         }
        //     }
        //     let deeplinkItem = Models.deeplink.create({
        //         url: budget.bookurl,
        //     })
        //     deeplinkItem = await deeplinkItem.save();

        //     let trafficBudget: ITrafficBudgetItem = {
        //         id: budget.id,
        //         no: budget.no,
        //         agent: budget.agent,
        //         carry: budget.carry,
        //         departTime: budget.departTime,
        //         arrivalTime: budget.arrivalTime,
        //         trafficType: budget.trafficType,
        //         cabin: budget.cabin,
        //         fromCity: budget.fromCity,
        //         toCity: budget.toCity,
        //         type: EBudgetType.TRAFFIC,
        //         price: budget.price,
        //         unit: budget.unit,
        //         rate: budget.rate,
        //         discount: discount,
        //         markedScoreData: budget.markedScoreData,
        //         prefers: allPrefers,
        //         bookurl: budget.bookurl,
        //         deeplinkData: budget.deeplinkData,
        //         destinationStation: budget.destinationStation,
        //         originStation: budget.originStation,
        //         segs: budget.segs
        //     }

        //     return trafficBudget as ITrafficBudgetItem;
        // }))


        // return staffBudgets;




    }
}






 //装载allPrefer，请求预算