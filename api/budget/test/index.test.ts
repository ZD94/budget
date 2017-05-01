/**
 * Created by wlh on 2017/4/26.
 */

'use strict';

var assert = require("assert");
var API = require("@jingli/dnode-api");
import moment = require("moment");
import {countRoom, countDays} from "../helper";
import {EGender, EHotelStar, ETrainSeat, EAirCabin, IQueryBudgetParams} from "_types/budget";
import Logger from "@jingli/logger";
const logger = new Logger("mocha");

describe("api/budget", () => {

    describe("hotel", function() {
        it("#API.budget.getHotelBudget should throw error", () => {
            return API.budget.getHotelBudget()
                .catch( (err) => {
                    assert.equal(err.code, 500);
                    return;
                })
        })

        it("#API.budget.getHotelBudget should be ok without hotels", function() {
            this.timeout(5000)
            let dateFormat = 'YYYY-MM-DD'
            let params = {
                // hotels,
                checkInDate: moment().add(3, 'days').format(dateFormat),
                checkOutDate: moment().add(4, 'days').format(dateFormat),
                prefers: [],
                policies: {
                    "staff": {}
                },
                staffs: [
                    {
                        "sex": EGender.FEMALE,
                        "policy": "staff",
                    }
                ],
                combineRoom: false,
                city:"CT_131",
                // isRetMarkedData: true
            }
            return API.budget.getHotelBudget(params)
                .then( (budget) => {
                    logger.log('单人预算结果:==>'+JSON.stringify(budget));
                    return;
                })
        })

        it("#API.budget.getHotelBudget should be ok without hotels AND muti staffs", function() {
            this.timeout(5000)
            let dateFormat = 'YYYY-MM-DD'
            let params = {
                // hotels,
                checkInDate: moment().add(3, 'days').format(dateFormat),
                checkOutDate: moment().add(4, 'days').format(dateFormat),
                prefers: [],
                policies: {
                    "staff": {
                        hotelStar: EHotelStar.FIVE
                    },
                    "manager": {
                        hotelStar: EHotelStar.FOUR
                    }
                },
                staffs: [
                    {
                        "sex": EGender.FEMALE,
                        "policy": "staff",
                    },
                    {
                        "sex": EGender.MALE,
                        "policy": "manager",
                    }
                ],
                city:"CT_131",
                // isRetMarkedData: true
            }
            return API.budget.getHotelBudget(params)
                .then( (budgetResult) => {
                    logger.log("多人预算结果==>"+ JSON.stringify(budgetResult));
                    return true;
                })
        })




    })

    describe("countRoom", function() {
        it("#countRoom should be ok with combineRoom=true AND 1M+1FM=2 rooms", function() {
            let staffs = [
                {
                    gender: EGender.MALE,
                    policy: ""
                },
                {
                    gender: EGender.FEMALE,
                    policy: ""
                }
            ]
            let num = countRoom(staffs, true);
            assert.equal(num, 2);
        })

        it("#countRoom should be ok with combineRoom=true AND 2M+1FM=2 rooms", function() {
            let staffs = [
                {
                    gender: EGender.MALE,
                    policy: ""
                },
                {
                    gender: EGender.MALE,
                    policy: ""
                },
                {
                    gender: EGender.FEMALE,
                    policy: ""
                }
            ]
            let num = countRoom(staffs, true);
            assert.equal(num, 2);
        });

        it("#countRoom should be ok with combineRoom=true AND (3M+1FM=3)", function() {
            let staffs = [
                {
                    gender: EGender.MALE,
                    policy: ""
                },
                {
                    gender: EGender.MALE,
                    policy: ""
                },
                {
                    gender: EGender.MALE,
                    policy: ""
                },
                {
                    gender: EGender.FEMALE,
                    policy: ""
                }
            ]
            let num = countRoom(staffs, true)
            assert.equal(num, 3);
        })

        it("#countRoom should be ok with combineRoom=false", function() {
            let staffs = [
                {
                    gender: EGender.MALE,
                    policy: ""
                },
                {
                    gender: EGender.FEMALE,
                    policy: ""
                }
            ]
            let num = countRoom(staffs, false);
            assert.equal(num, 2);
        })
    })

    describe("countDays", function() {
        it("#countDays should be ok", function() {
            let beginTime = moment('2017-05-10 12:00').toDate();
            let endTime = moment('2017-05-10 23:00').toDate();

            let days = countDays(endTime, beginTime);
            assert.equal(0, days);
        });

        it("#countDays should be ok", function() {
            let beginTime = moment('2017-05-10T12:00').toDate();
            let endTime = moment('2017-05-11T05:00').toDate();

            let days = countDays(endTime, beginTime);
            assert.equal(1, days);
        });

        it("#countDays should throw error when endTime < beginTime", function() {
            let beginTime = moment('2017-05-11T05:00').toDate();
            let endTime = moment('2017-05-10T12:00').toDate();

            let days;
            days = countDays(endTime, beginTime)
            assert.equal(0, days);

        });
    })


    describe("traffic", function() {

        it("#API.budget.getTrafficBudget should be ok", async function() {
            this.timeout(5 * 1000)
            let params = {
                staffs: [
                    {
                        sex: 1,
                        policy: "staff"
                    }
                ],
                policies: {
                    "staff": {
                        trainSeat: [ETrainSeat.FIRST_SEAT, ETrainSeat.SECOND_SEAT],
                        cabin: [EAirCabin.ECONOMY]
                    }
                },
                fromCity: 'CT_131',
                toCity: 'CT_289',
                beginTime: moment().add(3, 'days').format("YYYY-MM-DD HH:mm:ss"),
                endTime: moment().add(4, 'days').format("YYYY-MM-DD HH:mm:ss")
            }
            let budgets = await API.budget.getTrafficBudget(params);
            return budgets;
        })

        it("#API.budget.getTrafficBudget should be ok with mutip staffs", async function() {
            this.timeout(5 * 1000)
            let params = {
                staffs: [
                    {
                        sex: 1,
                        policy: "staff"
                    },
                    {
                        sex: 1,
                        policy: "manager"
                    }
                ],
                policies: {
                    "staff": {
                        trainSeat: [ETrainSeat.FIRST_SEAT, ETrainSeat.SECOND_SEAT],
                        cabin: [EAirCabin.ECONOMY]
                    },
                    "manager": {
                        trainSeat: [ETrainSeat.FIRST_SEAT, ETrainSeat.PRINCIPAL_SEAT],
                        cabin: [EAirCabin.BUSINESS, EAirCabin.FIRST]
                    }
                },
                fromCity: 'CT_131',
                toCity: 'CT_289',
                beginTime: moment().add(3, 'days').format("YYYY-MM-DD HH:mm:ss"),
                endTime: moment().add(4, 'days').format("YYYY-MM-DD HH:mm:ss")
            }
            let budgets = await API.budget.getTrafficBudget(params);
            logger.log("多人预算==>"+ JSON.stringify(budgets));
            return budgets;
        })
    })
    
    describe("getBudget", function() {

        it("#API.budget.getBudget should be ok", function(done) {
            let params = {
                fromCity: 'CT_231',
                staffs: [
                    {
                        gender: EGender.FEMALE,
                        policy: 'staff'
                    }
                ],
                policies: {
                    "staff": {
                        hotelStar: [EHotelStar.FIVE, EHotelStar.FOUR]
                    }
                },
                segments:[
                    {
                        city: 'CT_131',
                        beginTime: moment().add(3, 'days').toDate(),
                        endTime: moment().add(4, 'days').toDate(),
                    }
                ],
                ret: false
            } as IQueryBudgetParams
            return API.budget.createBudget(params)
                .then( (budgetResult) => {
                    logger.log("budgets==>"+ JSON.stringify(budgetResult));
                    let cities = budgetResult.cities;
                    assert.equal(!!cities, true);
                    assert.equal(cities[0], 'CT_131');
                    done();
                })
                .catch( (err) => {
                    throw err;
                })
        })

        it("#API.budget.getBudget should be ok", function(done) {
            this.timeout(10 * 1000);
            let params = {
                fromCity: 'CT_231',
                staffs: [
                    {
                        gender: EGender.FEMALE,
                        policy: 'staff'
                    },
                    {
                        gender: EGender.MALE,
                        policy: 'manager'
                    }
                ],
                policies: {
                    "staff": {
                        hotelStar: [EHotelStar.FOUR],
                        trainSeat: [ETrainSeat.SECOND_SEAT],
                        cabin: [EAirCabin.ECONOMY]
                    },
                    "manager": {
                        hotelStar: [EHotelStar.FIVE],
                        trainSeat: [ETrainSeat.FIRST_SEAT],
                        cabin: [EAirCabin.FIRST, EAirCabin.BUSINESS]
                    }
                },
                segments:[
                    {
                        city: 'CT_131',
                        beginTime: moment().add(3, 'days').toDate(),
                        endTime: moment().add(4, 'days').toDate(),
                    },
                    {
                        city: 'CT_179',
                        beginTime: moment().add(4, 'days').toDate(),
                        endTime: moment().add(5, 'days').toDate(),
                    }
                ],
                ret: false
            } as IQueryBudgetParams
            return API.budget.createBudget(params)
                .then( (budgetResult) => {
                    logger.log("budgets==>"+ JSON.stringify(budgetResult));
                    let cities = budgetResult.cities;
                    assert.equal(!!cities, true);
                    assert.equal(cities[0], 'CT_131');
                    done();
                })
                .catch( (err) => {
                    throw err;
                })
        })

        it("#API.budget.getBudget should be ok", function(done) {
            this.timeout(10 * 1000);
            let params = {
                fromCity: 'CT_231',
                staffs: [
                    {
                        gender: EGender.FEMALE,
                        policy: 'staff'
                    },
                    {
                        gender: EGender.MALE,
                        policy: 'manager'
                    }
                ],
                policies: {
                    "staff": {
                        hotelStar: [EHotelStar.FOUR],
                        trainSeat: [ETrainSeat.SECOND_SEAT],
                        cabin: [EAirCabin.ECONOMY]
                    },
                    "manager": {
                        hotelStar: [EHotelStar.FIVE],
                        trainSeat: [ETrainSeat.FIRST_SEAT],
                        cabin: [EAirCabin.FIRST, EAirCabin.BUSINESS]
                    }
                },
                segments:[
                    {
                        city: 'CT_131',
                        beginTime: moment().add(3, 'days').toDate(),
                        endTime: moment().add(4, 'days').toDate(),
                    },
                    {
                        city: 'CT_179',
                        beginTime: moment().add(4, 'days').toDate(),
                        endTime: moment().add(5, 'days').toDate(),
                    }
                ],
                ret: true
            } as IQueryBudgetParams
            return API.budget.createBudget(params)
                .then( (budgetResult) => {
                    logger.log("budgets==>"+ JSON.stringify(budgetResult));
                    let cities = budgetResult.cities;
                    assert.equal(!!cities, true);
                    assert.equal(cities[0], 'CT_131');
                    assert.equal(cities[cities.length-1], 'CT_231');
                    done();
                })
                .catch( (err) => {
                    throw err;
                })
        })
    })
})