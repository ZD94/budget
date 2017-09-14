/**
 * Created by ycl on 2017/9/11.
 */
import {AbstractController, Restful} from "@jingli/restful";
import {Models} from "_types";
var _ = require("lodash");
var defaultCurrency = '4a66fb50-96a6-11e7-b929-cbb6f90690e1';  //人民币

@Restful()
export class CurrencyRateController extends AbstractController {
    constructor() {
        super();
    }

    $isValidId(id: string) {
        return /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(id);
    }

    async find(req, res, next) {
        let {currencyTo} = req.query;
        if(!currencyTo || typeof(currencyTo) == 'undefined') {
            return res.json(this.reply(400, []));
        }
        let currencies = await Models.currency.all({
            where: {
                currencyCode: currencyTo
            }
        });
        let exchangeRateDetail = [];
        if(currencies && currencies.length){
            exchangeRateDetail = await Models.currencyRate.find({
                where:{
                    currencyFromId: defaultCurrency,
                    currencyToId: currencies[0].id,
                },
                order: [["postedAt", "desc"], ["createdAt", "desc"]]
            });
            if(exchangeRateDetail && exchangeRateDetail.length){
                exchangeRateDetail = _.concat([], exchangeRateDetail[0]);
            }
        }
        res.json(this.reply(200, exchangeRateDetail));
    }



}