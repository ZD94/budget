/**
 * Created by wlh on 2017/3/10.
 */

'use strict';

import {getBudget} from '../../lib/budget';
import {IQueryBudgetParams, EAirCabin, EGender} from "../../lib/type";

describe("lib/budget.ts", () => {
    it("#getBudget() should be oa", (done) => {
        let params: IQueryBudgetParams = {
            fromCity: 'CT_131',
            appid: '123456',
            sign: 'test',
            timestamp: Date.now()+"",
            ret: true,
            segs: [
                {
                    city: 'CT_231',
                    beginTime: '2017-01-01',
                    endTime: '2017-01-01',
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