/**
 * Created by wlh on 2017/6/9.
 */

'use strict';
import API from '@jingli/dnode-api';
import {TASK_NAME} from '../types';
import {AbstractDataSupport} from "../data-support";
import {ITicket} from "../../_types/budget";
import Config = require("@jingli/config");
var redis = require("redis");

let redis_client = null;

let Train_IS_USE_CACHE = true;
let Flight_IS_USE_CACHE = true;
let Cache_Duration = 10*60;

function get_redis(){
    if(!redis_client){
        redis_client = redis.createClient(Config.redis);
        redis_client.on('error', function(err){

        });
    }
    return redis_client;
}

export interface ISearchTicketParams {
    leaveDate: string;
    originPlace: string;
    destination: string;
}

export class TrafficSupport extends AbstractDataSupport<ITicket> {
    async search_tickets(params: ISearchTicketParams) {
        let self = this;
        let flightTickets = await this.search_flight_tickets(params);
        let trainTickets = await this.search_train_tickets(params);
        return [...trainTickets, ...flightTickets];
    }

    private async search_train_tickets(params) {
        let {originPlace, destination, leaveDate} = params;
        let originPlaceObj = await API['place'].getCityInfo({cityCode: originPlace});
        let destinationObj = await API['place'].getCityInfo({cityCode: destination});

        let result:  ITicket[] =[];
        let client = get_redis();
        let key = `train:${originPlace}-${destination}:${leaveDate}`;
        if(Train_IS_USE_CACHE){
            try{
                result = JSON.parse(await client.getAsync(key));

            } catch(err){}
            if(result && result.length) {
                return result;
            }

        }


        if (!originPlaceObj.isAbroad && !destinationObj.isAbroad) {
             result = await this.getData(TASK_NAME.TRAIN, params);
        }
        if(result && result.length) {
            if(Train_IS_USE_CACHE){
                await client.setAsync(key, JSON.stringify(result), 'ex', Cache_Duration);
            }
        }
        //欧铁先注释掉了
        //this.getData(TASK_NAME.TRAIN_EUR, params);
        return result;
    }

    private async search_flight_tickets(params) {
        let {originPlace, destination,leaveDate} = params;
        let originPlaceObj = await API['place'].getCityInfo({cityCode: originPlace});
        let destinationObj = await API['place'].getCityInfo({cityCode: destination});

        let result:  ITicket[] =[];
        let client = get_redis();
        let key = `flight:${originPlace}-${destination}:${leaveDate}`;

        if(Flight_IS_USE_CACHE){
            try{
                result = JSON.parse(await client.getAsync(key))

            } catch(err){}
            if(result && result.length) {
                return result;
            }
        }

        if (!originPlaceObj.isAbroad && !destinationObj.isAbroad) {
            result = await this.getData(TASK_NAME.FLIGHT, params);
        }
        if(originPlaceObj.isAbroad || destinationObj.isAbroad){
            result = await this.getData(TASK_NAME.FLIGHT_ABROAD, params);
        }

        if(result && result.length) {
            if(Train_IS_USE_CACHE){
                await client.setAsync(key, JSON.stringify(result), 'ex', Cache_Duration);
            }
        }
        return result;
    }
}

var trafficSupport = new TrafficSupport();
export default trafficSupport;