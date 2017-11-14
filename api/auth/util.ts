import * as _ from 'lodash/fp';
const md5 = require('md5');

// getSortedStr :: Object -> String
const getSortedStr = _.compose(_.replace(/\s+/g, ''), JSON.stringify, sortData);

export function genSign(params: object, appSecret: string) {
    const temp = getSortedStr(params);
    const time = Math.floor(Date.now() / 1000);
    const hex = time.toString(16).toUpperCase();
    return md5(temp + hex + appSecret) + hex;
}

/**
 * 校验签名
 * @param params 
 * @param sign 
 * @param appSecret 
 */
export function verifySign(params: object, sign: string, appSecret: string) {
    if (sign.length != 40) {
        return false;
    }
    
    // Verify the expires
    const hex = sign.substr(-8);
    const time = parseInt(hex.toLowerCase());
    if (Date.now() / 1000 - time > 5 * 60) {
        return false;
    }

    // Compare signature
    const temp = getSortedStr(params);
    const signature = md5(temp + hex + appSecret) + hex;
    return sign == signature;
}

function sortData(data) {
    if (!isObject(data)) {
        return data
    }
    let sortedKeys = [];
    let sortedObject = {};
    for (let key in data) {
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
    sortedKeys.forEach((key) => {
        sortedObject[key] = data[key];
    });
    return sortedObject;
}

function isObject(obj) {
    return Object.prototype.toString.bind(obj).call() == '[object Object]'
}
