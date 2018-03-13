'use strict';
import {AbstractPrefer} from "./index";
import {IFinalHotel} from "_types/budget";

let data = require('./hotel-data.json')
class PriceDeviation extends AbstractPrefer<IFinalHotel> {
    private score: number

   constructor(name,options){
        super(name,options)
       if(!this.score){
            this.score = 0
       }
   }

    async markScoreProcess(hotels: IFinalHotel[]): Promise<IFinalHotel[]> {
        let sporadicSeries = [];
        let mediumStar = [];
        hotels.map((hotel)=>{
            if(hotel.star == 0){
                sporadicSeries.push(hotel)
            }else if(hotel.star == 1 || hotel.star == 2 || hotel.star == 3){
                mediumStar.push(hotel)
            }else {

            }

        })
        return hotels
    }

}


export = PriceDeviation;

