/**
 * Created by ycl on 2017/9/11.
 */
import {AbstractController, Restful} from "@jingli/restful";
import {Models} from "_types";
import { autoSignReply } from 'http/reply';
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

    @autoSignReply()
    async find(req, res, next) {
        let {currencyTo} = req.query;
        if(!currencyTo || typeof(currencyTo) == 'undefined') {
            return res.json(this.reply(400, []));
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
        res.json(this.reply(200, exchangeRateDetail));
    }



}