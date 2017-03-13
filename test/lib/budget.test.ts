/**
 * Created by wlh on 2017/3/10.
 */

'use strict';

import {getBudget} from 'lib/budget';
import {IQueryBudgetParams, EAirCabin, EGender} from "_type/budget";
import {ICity} from "_type/city";

let CITY_BJ: ICity = {
    id: 'CT_131',
    name: "北京",
    code: "BJS",
    isAbroad: false,
    letter: 'BJ'
}

describe("lib/budget.ts", () => {
    it("#getBudget() should be oa", (done) => {
        let params: IQueryBudgetParams = {
            fromCity: CITY_BJ,
            appid: '123456',
            sign: 'test',
            timestamp: Date.now()+"",
            ret: true,
            segs: [
                {
                    city:CITY_BJ,
                    beginTime: new Date('2017-01-01'),
                    endTime: new Date('2017-01-01'),
                    location: {
                        latitude: 123,
                        longitude: 46,
                    }
                }
            ],
            policies: {
                "default": {
                    cabin: [EAirCabin.ECONOMY],
                    hotelStar: [],
                    trainSeat: []
                }
            },
            staffs: [{
                gender: EGender.MALE,
                policy: "default"
            }],
            combineRoom: false,
        }
        return getBudget(params)
            .then( (result) => {
                console.log(JSON.stringify(result))
                done();
            })
            .catch( (err) => {
                throw err
            })
    })
})