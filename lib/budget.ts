/**
 * Created by wlh on 2017/3/10.
 */

'use strict';
import {
    IQueryBudgetParams, IQueryBudgetResult, IBudgetItem, ITrafficBudgetItem, ETrafficType, EAirCabin,
    EBudgetType, IHotelBudgetItem, EHotelStar
} from "./type";

export async function getBudget(params: IQueryBudgetParams) :Promise<IQueryBudgetResult>{
    let budget: ITrafficBudgetItem = {
        departTime: '2017-01-01',
        arrivalTime: '2017-01-01',
        trafficType: ETrafficType.PLANE,
        cabin: EAirCabin.ECONOMY,
        fromCity: 'CT_131',
        toCity: 'CT_132',
        type: EBudgetType.TRAFFIC,
        price: 1000,
        discount: 0.5,
    }

    let hotelBudget: IHotelBudgetItem = {
        checkInDate: '2017-06-01',
        checkOutDate: '2017-09-01',
        star: EHotelStar.FIVE,
        price: 500,
        type: EBudgetType.HOTEL,
    }

    let result: IQueryBudgetResult = {
        id: "123",
        budgets: [
            budget,
            hotelBudget,
        ]
    }
    return result;
}