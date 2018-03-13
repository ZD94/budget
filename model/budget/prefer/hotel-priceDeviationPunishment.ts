'use strict'
import {AbstractPrefer} from './index'
import {IFinalHotel} from "_types/budget"

class PriceDeviation extends AbstractPrefer<IFinalHotel> {
    private score: number

   constructor(name,options){
        super(name,options)
       if(!this.score){
            this.score = 0
       }
   }

    async markScoreProcess(hotels: IFinalHotel[]): Promise<IFinalHotel[]> {
        let sporadicSeries = hotels.map((hotel)=>{

        })

    }

}


export = PriceDeviation;

let data = {

}
let obj = new PriceDeviation("PriceDeviation",{
    score:0
})
obj.markScoreProcess(data)
