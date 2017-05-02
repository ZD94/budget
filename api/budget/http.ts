/**
 * Created by wlh on 2017/4/28.
 */

'use strict';
import {IQueryBudgetParams} from "../../_types/budget";
import ApiTravelBudget from "./index";

function checkSign(appid, timestamp, sign) :boolean {
    return appid && appid == 'jinglitest';
}

export = function(app) {
    app.use('/api/v1', function(req, res, next) {
        let {appid, timestamp, sign} = req.headers;
        if (checkSign(appid, timestamp, sign)) {
            return next();
        }
        return res.send(403, 'invalid sign');
    });

    app.post('/api/v1/budget/make', (req, res, next) => {
        let qs: IQueryBudgetParams
        let json = req.body.json;
        if (typeof json == 'string') {
            qs = JSON.parse(json);
        } else {
            qs = json;
        }
        return ApiTravelBudget.createBudget(qs)
            .then( (result) => {
                res.json(result);
            })
            .catch(next);
    })

    app.get('/api/v1/budget/info', (req, res, next) => {
        let {id, isRetMarkedData} = req.query;
        if (isRetMarkedData == 'false' || isRetMarkedData == '0') {
            isRetMarkedData = false;
        }
        return ApiTravelBudget.getBudgetCache({id, isRetMarkedData})
            .then( (result) => {
                res.json(result);
            })
            .catch(next);
    })

    app.use('/api/v1/budget', function(err, req, res, next) {
        res.json(err);
    })
}