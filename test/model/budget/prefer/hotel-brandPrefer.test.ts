/*
 * @Author: Mr.He 
 * @Date: 2018-03-23 17:53:36 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-03-26 11:25:03
 * @content what is the content of this file. */


import assert = require("assert");
import HotelBrandPrefer = require('../../../../model/budget/prefer/hotel-brandPrefer');
let data = require("./hotel-data");


let pre = {
    "name": "hotelBrand",
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
    },
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
    "baseScore": 1000,
    "category": [
        {
            "contains": ['桔子水晶', '香格里拉'],
            "percentage": 50
        },
        {
            "contains": ['宿适精选酒店'],
            "percentage": 30
        },
        {
            "contains": ['金茂君悦'],
            "percentage": 80
        }
    ],
    "options": {
        "baseScore": 0,
        "category": [
            {
                "contains": ['桔子水晶', '香格里拉'],
                "percentage": 50
            },
            {
                "contains": ['宿适精选酒店'],
                "percentage": 30
            },
            {
                "contains": ['金茂君悦'],
                "percentage": 80
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
    });

    

    it("数据第0, 6项，符合酒店第1级别标准, 加50000", async () => {
        assert.equal(data[0].score, 50000);
    });


    it("数据第23项，符合酒店第2级别标准, 加30000", async () => {
        assert.equal(data[23].score, 30000);
    });

    it("数据第26项，符合酒店第3级别标准, 加80000", async () => {
        assert.equal(data[26].score, 80000);
    });

    it("数据第4项，不符合酒店第1，2，3级别标准, 加0", async () => {
        assert.equal(data[4].score, 0);
    });

});