/**
 * Created by wlh on 2017/4/26.
 */

'use strict';

var assert = require("assert");
var API = require("@jingli/dnode-api");
import moment = require("moment");
import {countRoom} from "../helper";
import {EGender, EHotelStar} from "_types/budget";

describe("api/budget", () => {

    it("should be ok", ()=> {
        return true;
    });

    it("API.budget.getHotelBudget should throw error", () => {
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
                console.log('单人预算结果:==>', budget);
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
                console.log(JSON.stringify(budgetResult));
                return true;
            })
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
})