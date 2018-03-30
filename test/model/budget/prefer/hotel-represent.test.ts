/*
 * @Author: Mr.He 
 * @Date: 2018-03-08 17:53:36 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-03-08 19:11:13
 * @content what is the content of this file. */

import assert = require("assert");
import ScoreItem = require('../../../../model/budget/prefer/hotel-represent');
let data = require("./hotel-data");

describe("hotel-represent", async () => {

    before(function () {
        data.map((item) => {
            delete item.score;
            delete item.reasons;
        });
        const prefer = new ScoreItem('hotelRepresent', {
            score: 2000
        });
        prefer.markScoreProcess(data);
    });

    it("数据第9项，如家精选，应该被打分", async () => {
        assert.equal(data[9].score, 2000);
    });

    it("数据第74项，锦江之星，应该被打分", async () => {
        assert.equal(data[74].score, 2000);
    });

    it("数据第6项，桔子水晶，应该被打分", async () => {
        assert.equal(data[6].score, 2000);
    });

    it("数据第79项，希尔顿，应该被打分", async () => {
        assert.equal(data[79].score, 2000);
    });

    it("数据第77项，上海贝轩大公馆，不应该被打分", async () => {
        assert.notEqual(data[77].score, 2000);
    });
});