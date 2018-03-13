

import {loadPrefers, DEFAULT_PREFER_CONFIG_TYPE, mergePrefers} from "../../../../model/budget/prefer/index";

const assert = require("assert");
const sysPrefer = require("../../../../model/budget/prefer/default-prefer/sys-prefer.json");
const defaultPrefer = require("../../../../model/budget/prefer/default-prefer/default-company-prefer.json");

/**
 * modify loadPrefers logic to merge company-set prefers into company default prefers
 * 
 * @method loadPrefers(prefers: any[], qs: { local: any }, type?: DEFAULT_PREFER_CONFIG_TYPE)
 * 
 */


 describe(`测试loadPrefers功能正常`, async () => {

    it(`当公司偏好为空数组, 偏好类型为: ${DEFAULT_PREFER_CONFIG_TYPE.ABROAD_HOTEL}`, async () => {
        let timing = Date.now();
        let allPrefers = await loadPrefers([], {local: {}}, DEFAULT_PREFER_CONFIG_TYPE.ABROAD_HOTEL)
        let finish = Date.now()
        console.log("====timing: ", timing, finish, finish - timing)
        // console.log("=========>allPrefers: ", allPrefers)
        let expectedPrefers = await mergePrefers(sysPrefer.abroadHotel,defaultPrefer.abroadHotel)
        // console.log("=========>allPrefers: ", expectedPrefers)
        assert.equal(allPrefers.length, expectedPrefers.length)
    })
 })