/*
 * @Author: Mr.He 
 * @Date: 2018-03-23 17:53:36 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-03-23 17:44:28
 * @content what is the content of this file. */


import assert = require("assert");
import HotelBrandPrefer = require('../../../../model/budget/prefer/hotel-brandPrefer');
let data = require("./hotel-data");

var fs = require("fs");

let pre = {
    "name": "hotelBrand",
    "baseScore": 1000,
    "options": {
        "baseScore": 1000,
        "category": {
            "1": {
                "contains": ['桔子水晶', '香格里拉'],
                "percentage": 50
            },
            "2": {
                "contains": ['宿适精选酒店'],
                "percentage": 30
            },
            "3": {
                "contains": ['金茂君悦'],
                "percentage": 80
            }
        }
    }
}


let preSet = {
    "name": "hotelBrand",
    "options": {
        "baseScore": 0,
        "category": [
            {
                "contains": ['桔子水晶', '香格里拉'],
                "percentage": 0
            },
            {
                "contains": ['宿适精选酒店'],
                "percentage": 0
            },
            {
                "contains": ['金茂君悦'],
                "percentage": 0
            }
        ]
    }
}

describe("hotel-brand", async () => {

    before(async function () {
        data.map((item) => {
            delete item.score;
            delete item.reasons;
        });
        const prefer = new HotelBrandPrefer('hotelBrandPrefer', pre);
        data = await prefer.markScoreProcess(data);
        console.log("====data: ", data[0])
    });

    

    it("数据第0项，计算结果检查", async () => {
        assert.equal(0, 0);
        fs.writeFileSync("./file.json", JSON.stringify(data), 'utf-8');
    });

});