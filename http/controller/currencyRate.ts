/**
 * Created by ycl on 2017/9/11.
 */
import {AbstractController, Restful} from "@jingli/restful";
import {Models} from "_types";
<<<<<<< HEAD
import {Request, Response} from "express-serve-static-core";
=======
import { autoSignReply } from 'http/reply';
>>>>>>> 90d97f7956692e00c3d292fe00cb2affcc125c9d
var _ = require("lodash");
var defaultCurrency = 'CNY';
@Restful()
export class CurrencyRateController extends AbstractController {
    constructor() {
        super();
    }

    $isValidId(id: string) {
        return /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(id);
    }

<<<<<<< HEAD
    async find(req: Request, res: Response, next: Function) {
=======

    async find(req, res, next) {
>>>>>>> 90d97f7956692e00c3d292fe00cb2affcc125c9d
        let {currencyTo} = req.query;
        if(!currencyTo || typeof(currencyTo) == 'undefined') {
            return res.jlReply(this.reply(400, []));
        }
        let exchangeRateDetail = [];
        exchangeRateDetail = await Models.currencyRate.find({
            where:{
                currencyFrom: defaultCurrency,
                currencyTo: currencyTo,
            },
            order: [["postedAt", "desc"], ["createdAt", "desc"]]
        });
        if(exchangeRateDetail && exchangeRateDetail.length){
            exchangeRateDetail = _.concat([], exchangeRateDetail[0]);
        }
        res.jlReply(this.reply(200, exchangeRateDetail));
    }



}