/**
 * Created by wlh on 2018/3/8.
 */

'use strict';
import assert = require("assert")
import {loadPrefers, mergePrefers, DEFAULT_PREFER_CONFIG_TYPE, sysPrefer, defaultPrefer} from "../../../../model/budget/prefer/index";
const _ = require("lodash");


const qs ={"local":{"expectFlightCabins":[2],"leaveDate":"2018-03-15","earliestLeaveDateTime":"2018-03-17T02:00:00.000Z","latestArrivalDateTime":"2018-03-15T13:00:00.000Z"}}

// const budgetConfig = {"hotel": [], "traffic": [{"name": "trainDurationPrefer", "score": 80000, "trainDuration": 600}, {"name": "preferAirCompany", "score": 100000, "cheapSuppliers": [{"code": "CZ", "name": "南方航空 "}, {"code": "HU", "name": "海南航空"}, {"code": "ZH", "name": "深圳航空"}]}]}
const budgetConfig = {"hotel": [], "traffic": [{"name":"trainDurationPrefer","options":{"score":80000,"trainDuration":600}},{"name":"preferAirCompany","options":{"score":100000,"cheapSuppliers":[{"code":"CZ","name":"南方航空 "},{"code":"HU","name":"海南航空"},{"code":"ZH","name":"深圳航空"}]}}]}
describe("测试loadPrefers功能", async () => {

    it("公司设置偏好为空数据 类型为国外酒店 should be ok", async () => {
        let allPrefers = await loadPrefers([], {local: {}}, DEFAULT_PREFER_CONFIG_TYPE.ABROAD_HOTEL)
        assert.equal(allPrefers.length, 8)
    });
    it("公司设置偏好为空数据 类型为国外交通 should be ok", async () => {
        let allPrefers = await loadPrefers([], {local: {}}, DEFAULT_PREFER_CONFIG_TYPE.ABROAD_TRAFFIC)
        assert.equal(allPrefers.length, 14)
    });

    it("公司设置偏好为空数据, 类型为国内酒店 should be ok", async () => {
        let allPrefers = await loadPrefers([], {local: {}}, DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_HOTEL)
        assert.equal(allPrefers.length, 11)
    });

    it("公司设置偏好为空数据, 类型为国内交通 should be ok", async () => {
        let allPrefers = await loadPrefers([], {local: {}}, DEFAULT_PREFER_CONFIG_TYPE.DOMESTIC_TICKET)
        assert.equal(allPrefers.length, 13)
    });

    it("公司偏好不为空， 类型为国外交通 should be ok", async () => {
        let allPrefers = await loadPrefers(budgetConfig.traffic, qs, DEFAULT_PREFER_CONFIG_TYPE.ABROAD_TRAFFIC)
        
        let preferredAirlinesPreferExists = false;
        let cheapSupplierExists = false;
        await Promise.all(allPrefers.map(async (prefer) => {
            if(prefer.name == 'trainDurationPrefer') {
                assert.equal(prefer.options.trainDuration, 600);
                assert.notEqual(prefer.options.trainDuration, 360);
            }
            if(prefer.name == 'cheapSupplier'){
                cheapSupplierExists = true;
            }
            if(prefer.name == 'preferAirCompany'){
                preferredAirlinesPreferExists = true;
            }
        }))
        assert.equal(preferredAirlinesPreferExists, true)
        assert.equal(cheapSupplierExists, true)
    })


});