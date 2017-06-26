/**
 * Created by wlh on 2017/6/9.
 */

'use strict';
import API from '@jingli/dnode-api';
import {TASK_NAME} from '../types';
import {AbstractDataSupport} from "../data-support";
import {ITicket} from "../../_types/budget";

export interface ISearchTicketParams {
    leaveDate: string;
    originPlace: string;
    destination: string;
}

export class TrafficSupport extends AbstractDataSupport<ITicket> {
    async search_tickets(params: ISearchTicketParams) {
        let self = this;
        let flightTickets = await self.search_flight_tickets(params);
        let trainTickets = await self.search_train_tickets(params);
        return [...trainTickets, ...flightTickets];
    }

    private async search_train_tickets(params) {
        let {originPlace, destination} = params;
        let originPlaceObj = await API['place'].getCityInfo({cityCode: originPlace});
        let destinationObj = await API['place'].getCityInfo({cityCode: destination});
        if (!originPlaceObj.isAbroad && !destinationObj.isAbroad) {
            return this.getData(TASK_NAME.TRAIN, params);
        }
        //欧铁先注释掉了
        //this.getData(TASK_NAME.TRAIN_EUR, params);
        return [];
    }

    private async search_flight_tickets(params) {
        let {originPlace, destination} = params;
        let originPlaceObj = await API['place'].getCityInfo({cityCode: originPlace});
        let destinationObj = await API['place'].getCityInfo({cityCode: destination});
        if (!originPlaceObj.isAbroad && !destinationObj.isAbroad) {
            return this.getData(TASK_NAME.FLIGHT, params);
        }
        return this.getData(TASK_NAME.FLIGHT_ABROAD, params);
    }
}

var trafficSupport = new TrafficSupport();
export default trafficSupport;