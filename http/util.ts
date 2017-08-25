/**
 * Created by wlh on 2017/5/10.
 */

'use strict';

import crypto = require("crypto");

export function verifySign(options) {
    // return 0;
    let {timestamp, sign, data, secret} = options;
    if (!timestamp || timestamp + 5 * 60 * 1000 < Date.now()) {
        return 501;
    }
    let sysSign = getSign({secret, timestamp, data});
    return sysSign === sign ? 0 : 500;
}

export function sortData(data) {
    if (!isObject(data)) {
        return data
    }
    let sortedKeys = [];
    let sortedObject = {};
    for(let key in data) {
        sortedKeys.push(key);
        sortedKeys.sort();
        //排序value
        let val = data[key]
        if (isObject(val)) {
            val = sortData(val);
        }
        data[key] = val;
    }

    //将排序好的重新赋值
    sortedKeys.forEach( (key) => {
        sortedObject[key] = data[key];
    });
    return sortedObject;
}

export function getSign (options) {
    let {secret, timestamp, data} = options;

    if (!data) {
        data = {};
    }
    //排序
    let sortedData = sortData(data);
    //转成字符串
    sortedData = JSON.stringify(sortedData);
    //替换所有空格
    sortedData = sortedData.replace(/\s+/g, '');
    //拼接秘钥,和当前时间戳
    sortedData = sortedData+timestamp+secret;
    //计算签名
    let md5 = crypto.createHash("md5");
    let sysSign = md5.update(sortedData).digest('hex');
    return sysSign;
}

function isObject(obj) {
    return Object.prototype.toString.bind(obj).call() == '[object Object]'
}