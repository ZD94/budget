/**
 * Created by wlh on 2017/4/28.
 */

'use strict';
import {IQueryBudgetParams} from "../../_types/budget";
import ApiTravelBudget from "./index";

export = function(app) {
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
        let {id} = req.query;
        return ApiTravelBudget.getBudgetCache({id})
            .then( (result) => {
                res.json(result);
            })
            .catch(next);
    })

    app.use('/api/v1/budget', function(err, req, res, next) {
        res.json(err);
    })
}