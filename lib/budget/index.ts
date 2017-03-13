/**
 * Created by wlh on 2017/3/10.
 */

'use strict';
import {
    IQueryBudgetParams, IBudgetResult, IBudgetItem, ITrafficBudgetItem, ETrafficType, EAirCabin,
    EBudgetType, IHotelBudgetItem, EHotelStar, IQueryTrafficBudgetParams, IQueryHotelBudgetParams
} from "_type/budget";

async function getHotelBudget(params: IQueryHotelBudgetParams) :Promise<IHotelBudgetItem>{
    let hotelBudget: IHotelBudgetItem = {
        checkInDate: new Date('2017-06-01'),
        checkOutDate: new Date('2017-09-01'),
        star: EHotelStar.FIVE,
        price: 500,
        type: EBudgetType.HOTEL,
    }
    return hotelBudget;
}

async function getTrafficBudget(params: IQueryTrafficBudgetParams) :Promise<ITrafficBudgetItem> {
    let budget: ITrafficBudgetItem = {
        departTime: new Date('2017-01-01'),
        arrivalTime: new Date('2017-01-01'),
        trafficType: ETrafficType.PLANE,
        cabin: EAirCabin.ECONOMY,
        fromCity: {
            id: 'CT_131',
            name: '北京',
            code: 'BJS',
            letter: 'BJ',
            isAbroad: false,
        },
        toCity: {
            id:'CT_132',
            name: '上海',
            code: 'SHA',
            letter: 'SH',
            isAbroad: false
        },
        type: EBudgetType.TRAFFIC,
        price: 1000,
        discount: 0.5,
    }
    return budget;
}

export async function getBudget(params: IQueryBudgetParams) :Promise<IBudgetResult>{
    let {policies, staffs, segs, fromCity, prefers, ret} = params;

    let budgets: IBudgetItem[] = [];
    for(var i=0, ii=segs.length; i<ii; i++) {
        let seg = segs[i];
        let toCity = seg.city;
        let trafficParams = {
            policies,
            staffs,
            fromCity: fromCity,
            toCity: toCity,
            beginTime: seg.beginTime,
            endTime: seg.endTime,
            prefers,
        }
        let trafficBudget = await getTrafficBudget(trafficParams);
        budgets.push(trafficBudget);
        let hotelParams = {
            policies,
            staffs,
            city: toCity,
            checkInDate: seg.beginTime,
            checkOutDate: seg.endTime,
            prefers,
        }
        let hotelBudget = await getHotelBudget(hotelParams);
        budgets.push(hotelBudget);
        fromCity = toCity;
    }

    let result: IBudgetResult = {
        id: "123",
        budgets: budgets,
    }
    return result;
}