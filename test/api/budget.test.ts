/*
 * @Author: Mr.He 
 * @Date: 2018-01-19 16:35:24 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-01-19 19:00:00
 * @content what is the content of this file. */

import { budget } from "model/budget";
import { analyzeBudgetParams } from "model/budget/analyzeParams";


let params = {
    preferedCurrency: 'CNY',
    travelPolicyId: 'bb2d6960-acd0-11e7-80a9-d1533e629a64',
    companyId: '935fbeb0-acd0-11e7-ab1e-bdc5d9f254d3',
    staffs: [{ gender: 1, policy: 'domestic' }],
    destinationPlacesInfo:
        [{
            destinationPlace: 'CT_150',
            leaveDate: '2018-01-20T10:00:00.000Z',
            goBackDate: '2018-01-21T01:00:00.000Z',
            latestArrivalDateTime: '2018-01-20T10:00:00.000Z',
            earliestGoBackDateTime: '2018-01-21T01:00:00.000Z',
            isNeedTraffic: true,
            isNeedHotel: true,
            reason: ''
        }],
    originPlace: 'CT_131',
    isRoundTrip: true,
    goBackPlace: 'CT_131'
};

let params2 = {
    "callbackUrl": "abcdf",
    "travelPolicyId": "ae6e7050-af2a-11e7-abf6-9f811e5a6ff9",
    "companyId": "e3e7e690-1b7c-11e7-a571-7fedc950bceb",
    // "expectStep": STEP.FULL,
    "staffs": [
        {
            "gender": 1,
            "policy": "domestic"
        }
    ],
    "originPlace": "CT_075",
    "goBackPlace": "CT_075",
    "isRoundTrip": true,
    "destinationPlacesInfo":
        [{
            "destinationPlace": "CT_289",
            "leaveDate": "2018-01-24T10:00:00.000Z",
            "goBackDate": "2018-01-27T01:00:00.000Z",
            "latestArrivalDateTime": "2018-01-24T10:00:00.000Z",
            "earliestGoBackDateTime": "2018-01-27T01:00:00.000Z",
            "isNeedTraffic": true,
            "isNeedHotel": true,
            "reason": ""
        },
        {
            "destinationPlace": "CT_131",
            "leaveDate": "2018-01-27T10:00:00.000Z",
            "goBackDate": "2018-01-29T01:00:00.000Z",
            "latestArrivalDateTime": "2018-01-27T10:00:00.000Z",
            "earliestGoBackDateTime": "2018-01-29T01:00:00.000Z",
            "isNeedTraffic": true,
            "isNeedHotel": true,
            "reason": ""
        }]
};


/* 当天去，当天回 */
let params3 = {
    preferedCurrency: 'CNY',
    travelPolicyId: 'bb2d6960-acd0-11e7-80a9-d1533e629a64',
    companyId: '935fbeb0-acd0-11e7-ab1e-bdc5d9f254d3',
    staffs: [{ gender: 1, policy: 'domestic' }],
    destinationPlacesInfo:
        [{
            destinationPlace: 'CT_150',
            leaveDate: '2018-01-20T01:00:00.000Z',
            goBackDate: '2018-01-20T08:00:00.000Z',
            latestArrivalDateTime: '2018-01-20T01:00:00.000Z',
            earliestGoBackDateTime: '2018-01-20T08:00:00.000Z',
            isNeedTraffic: true,
            isNeedHotel: true,
            reason: ''
        }, {
            destinationPlace: 'CT_075',
            leaveDate: '2018-01-20T08:00:00.000Z',
            goBackDate: '2018-01-21T08:00:00.000Z',
            latestArrivalDateTime: '2018-01-20T08:00:00.000Z',
            earliestGoBackDateTime: '2018-01-21T08:00:00.000Z',
            isNeedTraffic: true,
            isNeedHotel: true,
            reason: ''
        }],
    originPlace: 'CT_131',
    isRoundTrip: true,
    goBackPlace: 'CT_131'
};


let testFn = async () => {
    let result = await budget.getBudget(params3);
    // console.log("result result ===>", result);
}

let goTest = 0;
if (goTest) {
    for (let i = 0; i < 1; i++) {
        setTimeout(testFn, 8000);
    }
}