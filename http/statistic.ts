/**
 * Created by wlh on 2017/5/11.
 */

'use strict';
import moment = require("moment");
import {Models} from "_types/index";

export= function(url: string){
    return function(req, res, next) {
        var appid = req.appid;
        if (!appid) {
            return next();
        }

        let ret = (async function(req, res, next) {
            //计算请求次数
            let today = moment().format('YYYYMMDD')
            let pager = await Models.statistic.find({where: {appid: appid, day: today, url: url}});
            let dayStatistic;
            if (pager && pager.length) {
                dayStatistic = pager[0];
            }
            if (!dayStatistic) {
                dayStatistic = Models.statistic.create({appid: appid, day: today, num: 0, url: url});
            }
            if (!dayStatistic) {
                dayStatistic.num = 0;
            }
            dayStatistic.num = parseInt(dayStatistic.num) + 1;
            await dayStatistic.save();
            return next();
        })(req, res, next);

        return ret.catch(function(err) {
            console.error(err);
            next();
        });
    }
}