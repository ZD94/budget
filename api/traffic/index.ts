/**
 * Created by wlh on 2017/6/9.
 */

'use strict';
import API from '@jingli/dnode-api';
import {TASK_NAME} from '../types';
import {AbstractDataSupport} from "../data-support";

export interface Ticket {

}
export class TrafficSupport extends AbstractDataSupport<Ticket> {
    async search_tickets(params) {
        let self = this;
        let flightTickets = await this.search_flight_tickets(params);
        let trainTickets = await this.search_train_tickets(params);
        return [...trainTickets, ...flightTickets];
    }

    private async search_train_tickets(params) {
        let trains = await this.getData(TASK_NAME.TRAIN, params);
        let eurTrains = await this.getData(TASK_NAME.TRAIN_EUR, params);
        return [...trains, ...eurTrains];
    }

    private async search_flight_tickets(params) {
        let flights = await this.getData(TASK_NAME.FLIGHT, params);
        let abroadFlights = await this.getData(TASK_NAME.FLIGHT_ABROAD, params);
        return [...flights, ...abroadFlights];
    }
}

var trafficSupport = new TrafficSupport();
export default trafficSupport;