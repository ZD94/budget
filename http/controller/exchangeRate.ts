/**
 * Created by ycl on 2017/9/11.
 */
import {AbstractController, Restful} from "@jingli/restful";
import {Models} from "_types";
var defaultCurrency = '4a66fb50-96a6-11e7-b929-cbb6f90690e1';


export class ExchangeRateController extends AbstractController {

    constructor() {
        super();
    }

    async find(req, res, next) {
        let {currencyTo} = req.params;
        console.log("parms: ", req.params)
        if(!currencyTo || typeof(currencyTo) == 'undefined') {
            return res.json(this.reply(400, []));
        }

        let currencies = await Models.currency.find({
            where: {
                currency_name: currencyTo
            }
        });
        let exchangeRateDetail = [];
        if(!currencies || !currencies.length){
            exchangeRateDetail = await Models.exchangeRate.find({
                where:{
                    currency_from_id: defaultCurrency,
                    currency_to_id: currencies[0].id,
                },
                order: [["postedAt", "desc"], ["createdAt", "desc"]]
            });
        }

        res.json(this.reply(200, exchangeRateDetail));
    }



}