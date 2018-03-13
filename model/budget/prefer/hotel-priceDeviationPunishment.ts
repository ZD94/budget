'use strict';
import {AbstractPrefer} from "./index";
import {IFinalHotel} from "_types/budget";

let s = -20000.0;
let k = 100.0;

class PriceDeviation extends AbstractPrefer<IFinalHotel> {
    private score: number

    constructor(name, options) {
        super(name, options)
        if (!this.score) {
            this.score = 0
        }
    }

    static compare(obj1, obj2) {
        let val1 = obj1.price;
        let val2 = obj2.price;
        if (val1 < val2) {
            return -1
        } else if (val1 > val2) {
            return 1
        } else {
            return 0
        }
    }

    async markScoreProcess(hotels: IFinalHotel[]): Promise<IFinalHotel[]> {

        let sporadicSeries = [];
        let mediumStar = [];
        let higherStar = [];

        hotels.map((hotel) => {
            if (!(hotel.price == undefined || hotel.price == 0)) {
                if (hotel.star == 0) sporadicSeries.push(hotel)

                if (hotel.star == 1 || hotel.star == 2 || hotel.star == 3) mediumStar.push(hotel)

                if (hotel.star == 4 || hotel.star == 5) higherStar.push(hotel)
            }
        });
        sporadicSeries = sporadicSeries.sort(PriceDeviation.compare);
        mediumStar = mediumStar.sort(PriceDeviation.compare);
        higherStar = higherStar.sort(PriceDeviation.compare);

        let series = [sporadicSeries, mediumStar, higherStar];

        let p = [];
        let p1 = [];
        let p2 = [];

        for (var i = 0; i <= 2; i++) {
            let len = series[i].length;
            if(!len){
                p.push(0)
                p1.push(0)
                p2.push(0)
            }else {
                let parameter1 = len / 2;
                let parameter2 = len * 0.05;
                let parameter3 = len * 0.95;
                p.push(series[i][parseInt(`${parameter1}`)].price);
                p1.push(series[i][parseInt(`${parameter2}`)].price);
                p2.push(series[i][parseInt(`${parameter3}`)].price);
            }
        }

        for (let hotel of hotels) {
            if (!hotel.reasons) hotel.reasons = [];
            if (!hotel.score) hotel.score = 0;
            if (hotel.price == 0 || hotel.price == undefined) {
                hotel.score += s;
                continue;
            }

            let index;
            if (hotel.star == 0 || hotel.star == undefined) index = 0
            if (hotel.star == 1 || hotel.star == 2 || hotel.star == 3) index = 1
            if (hotel.star == 4 || hotel.star == 5) index = 2

            let _p = p[index];
            let _p1 = p1[index];
            let _p2 = p2[index];
            if (series[index].length <= 10) {
                continue;
            }
            if (hotel.price >= _p1 && hotel.price <= _p2) {
                continue;
            }
            try {
                let pn = (s * (1 - 2 / (1 + Math.exp(Math.abs(hotel.price - _p) / k))));
                hotel.score += parseInt(`${pn}`);
                hotel.reasons.push(`价格偏差惩罚打分 ${hotel.score}`)
            }catch (e){
                console.log(e.message)
            }
        }
        return hotels
    }
}

export = PriceDeviation;

