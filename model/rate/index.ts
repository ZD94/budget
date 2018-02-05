/*
 * @Author: Mr.He 
 * @Date: 2018-02-05 15:29:11 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-02-05 18:49:19
 * @content 处理汇率相关业务. */

import Logger from "@jingli/logger";
let logger = new Logger("budget");
let scheduler = require('common/scheduler');
import { Models } from "_types";
import { CurrencyRate } from "_types/currency";
import config = require("@jingli/config");
import { restfulAPIUtil } from "api/restful";
let defaultCurrencyUnit = config.defaultCurrency;

function _scheduleTask() {
    let taskId = "currencyExchangeRate";
    logger.info('run task ' + taskId);
    scheduler('0 0 8 * * *', taskId, async function () {
        let where = {
            where: {},
            order: [['createdAt', 'ASC']]
        }
        let currencies = await Models.currency.all(where);
        for (let i = 0; i < currencies.length; i++) {
            if (currencies[i]['currencyCode'] == defaultCurrencyUnit) {
                continue;
            }
            let result: any = await requestExchangeRate(defaultCurrencyUnit, currencies[i]['currencyCode']);
            if (!result || !result.result || !result.result.length) {
                continue;
            }
            let exchangeRate = result.result as any[];
            let rate;
            for (let j = 0; j < exchangeRate.length; j++) {
                if (exchangeRate[j]["currencyF"] == defaultCurrencyUnit) {
                    rate = exchangeRate[j]["exchange"] || exchangeRate[j]["result"]
                }
            }
            if (rate) {
                let params = {
                    currencyFrom: defaultCurrencyUnit,  //人民币
                    currencyTo: currencies[i]['currencyCode'],    //美元
                    postedAt: exchangeRate[0]["updateTime"],
                    rate: rate
                };
                let obj = CurrencyRate.create(params);
                await obj.save();
            }
        }
    });
}

_scheduleTask();

async function requestExchangeRate(currencyFrom, currencyTo, num?: number): Promise<any> {
    let baseUrl = 'http://op.juhe.cn/onebox/exchange/currency';
    let result;
    num = num ? num : 0;
    try {
        num++;
        return await restfulAPIUtil.proxyHttp({
            uri: baseUrl,
            json: true,
            qs: {
                from: currencyFrom,
                to: currencyTo,
                key: config.juHeCurrencyAPIKey
            }
        });
    } catch (e) {
        console.error(e.message || e);
        if (num >= 1) {
            console.error("获取汇率失败");
            return null;
        } else {
            console.log("获取汇率重试");
            return await requestExchangeRate(currencyFrom, currencyTo, num);
        }
    }
}

export async function getRate(currencyTo: string, currencyFrom?: string) {
    currencyFrom = defaultCurrencyUnit;
    if (currencyTo == currencyFrom) {
        return 1;
    }
    let result = await Models.currencyRate.find({
        where: {
            currencyFrom,
            currencyTo
        },
        order: [['postedAt', 'desc'], ['createdAt', 'desc']]
    });
    if (result.length) {
        return result[0].rate;
    } else {
        console.error(`汇率查询失败: ${currencyFrom}, ${currencyTo}`);
        return 1;
    }
}