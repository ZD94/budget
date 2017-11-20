

const body = {
    "fromCity": "CT_131",
    "ret": 1,
    "backCity": "CT_289",
    "beginDate": "2017-11-16T02:31:37.005Z",
    "travelPolicyId": "b0162280-c065-11e7-8f74-57dfa728deae",
    "segments": [
        {
            "beginTime": "2017-11-17",
            "destinationPlace": "CT_332",
            "leaveDate": "2017-11-16T02:31:37.005Z",
            "goBackDate": "2017-11-16T02:31:37.005Z",
            "noTraffic": false,
            "noHotel": false,
            "city": "CT_131",
            "endTime": "2017-11-19"
        }
    ],
    "staffs": [
        {
            "sex": 1,
            "travelPolicyId": "b0162280-c065-11e7-8f74-57dfa728deae"
        }
    ]
}

import request = require('supertest');
import assert = require('assert');
import { getFullPath, getToken, validate, APP_SECRET, verifyReturnSign } from "./helper";
import { genSign } from '@jingli/sign';

describe('/sign', () => {

    it(`Generate sign`, done => {
        const time = Math.floor(Date.now() / 1000)
        const sign = genSign(body, time, APP_SECRET)
        console.log('sign:', time, sign)
        done()
    })

})