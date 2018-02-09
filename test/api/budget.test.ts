/*
 * @Author: Mr.He 
 * @Date: 2018-01-19 16:35:24 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-02-08 15:46:37
 * @content what is the content of this file. */

import { budget, STEP } from "model/budget";
import { analyzeBudgetParams } from "model/budget/analyzeParams";
import { Currency } from '_types/currency/currency';


let params = {
    preferedCurrency: 'CNY',
    travelPolicyId: 'bb2d6960-acd0-11e7-80a9-d1533e629a64',
    companyId: '935fbeb0-acd0-11e7-ab1e-bdc5d9f254d3',
    staffs: [{ gender: 1, policy: 'domestic' }],
    destinationPlacesInfo:
        [{
            destinationPlace: 'CT_150',
            leaveDate: '2018-03-20T10:00:00.000Z',
            goBackDate: '2018-03-21T01:00:00.000Z',
            latestArrivalDateTime: '2018-03-20T10:00:00.000Z',
            earliestGoBackDateTime: '2018-03-21T01:00:00.000Z',
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
            "leaveDate": "2018-03-24T10:00:00.000Z",
            "goBackDate": "2018-03-27T01:00:00.000Z",
            "latestArrivalDateTime": "2018-03-24T10:00:00.000Z",
            "earliestGoBackDateTime": "2018-03-27T01:00:00.000Z",
            "isNeedTraffic": true,
            "isNeedHotel": true,
            "reason": ""
        },
        {
            "destinationPlace": "CT_131",
            "leaveDate": "2018-03-27T10:00:00.000Z",
            "goBackDate": "2018-03-29T01:00:00.000Z",
            "latestArrivalDateTime": "2018-03-27T10:00:00.000Z",
            "earliestGoBackDateTime": "2018-03-29T01:00:00.000Z",
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
            leaveDate: '2018-03-20T01:00:00.000Z',
            goBackDate: '2018-03-20T08:00:00.000Z',
            latestArrivalDateTime: '2018-03-20T01:00:00.000Z',
            earliestGoBackDateTime: '2018-03-20T08:00:00.000Z',
            isNeedTraffic: true,
            isNeedHotel: true,
            reason: ''
        }, {
            destinationPlace: 'CT_075',
            leaveDate: '2018-03-20T08:00:00.000Z',
            goBackDate: '2018-03-21T08:00:00.000Z',
            latestArrivalDateTime: '2018-03-20T08:00:00.000Z',
            earliestGoBackDateTime: '2018-03-21T08:00:00.000Z',
            isNeedTraffic: true,
            isNeedHotel: true,
            reason: ''
        }],
    originPlace: 'CT_131',
    isRoundTrip: true,
    goBackPlace: 'CT_131'
};


let params4 = {
    "goBackPlace": "CT_131",
    "isRoundTrip": true,
    staffs: [{ gender: 1, policy: 'domestic' }],
    "originPlace": "CT_131",
    "projectName": "",
    currency: "EUR",
    "travelPolicyId": "7a4ceb50-f9ce-11e7-89c4-73c84750254b",
    "destinationPlacesInfo": [
        {
            "reason": "",
            "subsidy": {
                "template": null
            },
            "leaveDate": "2018-02-15T13:00:00.000Z",
            "goBackDate": "2018-02-17T02:00:00.000Z",
            "isNeedHotel": true,
            "isNeedTraffic": true,
            "destinationPlace": "1792943",
            "latestArrivalDateTime": "2018-02-15T13:00:00.000Z",
            "earliestGoBackDateTime": "2018-02-17T02:00:00.000Z"
        }
    ]
}

let params5 = {
    // callbackUrl: 'l.jingli365.com/api/v1/budget/7981c4d0-058f-11e8-96e0-afb5c70cc3c3/updateBudget',
    preferedCurrency: 'CNY',
    travelPolicyId: '7a4ceb50-f9ce-11e7-89c4-73c84750254b',
    companyId: '625c6110-f9ce-11e7-b540-af4848d193b7',
    staffs: [{ gender: 1, policy: 'domestic' }, { gender: 1, policy: 'domestic' }],
    currency: "CNY",
    destinationPlacesInfo:
        [{
            destinationPlace: '1796231',
            leaveDate: '2018-03-03T12:00:00.000Z',
            goBackDate: '2018-03-05T10:00:00.000Z',
            latestArrivalDateTime: '2018-03-03T12:00:00.000Z',
            earliestGoBackDateTime: '2018-03-05T10:00:00.000Z',
            isNeedTraffic: true,
            isNeedHotel: true,
            reason: ''
        }],
    originPlace: '1814905',
    isRoundTrip: true,
    goBackPlace: '1814905'
}


/* test enviornment */
let params6 = {
    "companyId": "f6350f90-4fbb-11e6-81af-4b3384f7a2a9",
    "goBackPlace": "2038349",
    "originPlace": "2038349",
    "expectStep": STEP.FINAL,
    "isRoundTrip": true,
    "travelPolicyId": "d3364020-4fbd-11e6-9bd0-918bb412d7c8", "destinationPlacesInfo": [{
        "reason": "", "isNeedHotel": true, "latestArrivalDateTime": "2018-02-20T12:25:29.000Z", "earliestGoBackDateTime": "2018-02-22T12:25:29.000Z", "destinationPlace": "1796231", "leaveDate": "2018-02-20T12:25:29.000Z", "goBackDate": "2018-02-22T12:25:29.000Z", "isNeedTraffic": true
    }],
    "callbackUrl": "",
    "staffs": [{ "gender": 0 }]
};


let params7 = {
    preferedCurrency: 'CNY',
    travelPolicyId: '61886c80-ada1-11e7-be58-77beedadf88e',
    companyId: '0f15daa0-a432-11e7-988b-b9f0504fc2e1',
    staffs: [{ gender: 1, policy: 'domestic' }],
    destinationPlacesInfo:
        [{
            destinationPlace: '1795563',
            leaveDate: '2018-02-08T10:00:00.000Z',
            goBackDate: '2018-02-09T01:00:00.000Z',
            latestArrivalDateTime: '2018-02-08T10:00:00.000Z',
            earliestGoBackDateTime: '2018-02-09T01:00:00.000Z',
            isNeedTraffic: true,
            isNeedHotel: true,
            subsidy: [Object],
            reason: ''
        }],
    originPlace: '2038349',
    isRoundTrip: true,
    goBackPlace: '2038349'
}

/* 线上 请求参数 */
let params8 = {
    preferedCurrency: 'CNY',
    travelPolicyId: 'd3364020-4fbd-11e6-9bd0-918bb412d7c8',
    companyId: 'f6350f90-4fbb-11e6-81af-4b3384f7a2a9',
    staffs: [{ gender: 2, policy: 'domestic' }],
    destinationPlacesInfo:
        [{
            destinationPlace: '1795563',
            leaveDate: '2018-02-19T10:00:00.000Z',
            goBackDate: '2018-02-20T01:00:00.000Z',
            latestArrivalDateTime: '2018-02-19T10:00:00.000Z',
            earliestGoBackDateTime: '2018-02-20T01:00:00.000Z',
            isNeedTraffic: true,
            isNeedHotel: true,
            businessDistrict: '22.733669,114.253232',
            selectName: '天健花园',
            reason: ''
        }],
    originPlace: '1796231',
    isRoundTrip: true,
    goBackPlace: '1796231'
};



let testFn = async () => {
    console.log("ok ok ok ok ok ok");
    let result = await budget.getBudget(params8);
    // console.log("result result ===>", result);
}


console.log("Test go. Please.");
let goTest = 1;
if (goTest) {
    for (let i = 0; i < 1; i++) {
        setTimeout(testFn, 8000);
    }
}