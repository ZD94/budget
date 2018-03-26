/**
 * Created by wlh on 16/8/15.
 */

'use strict';
import { IFinalHotel, EHotelStar } from "./interface";
import { AbstractPrefer } from "./AbstractPrefer";

class HotelBrandPrefer extends AbstractPrefer<IFinalHotel> {

    // private score: number;
    private options: any;
    private baseScore: number;

    constructor(name, options) {
        super(name, options);
        if (!this.baseScore) {
            this.baseScore = 0;
        }
        if (!this.options) {
            this.options = null;
        }
    }

    async markScoreProcess(hotels: IFinalHotel[]): Promise<IFinalHotel[]> {
        let self = this;
        console.log("=====hello world: ", this.baseScore)
        if(!this.options) return hotels;
        if(!this.baseScore) return hotels;
        console.log("=====hello world: ", this.baseScore)
        hotels = hotels.map((v) => {
            if (!v.score) v.score = 0;
            if (!v.reasons) v.reasons = [];
            
            for(let key in this.options){
                if(!this.options[key] || !this.options[key].contains || !this.options[key].contains.length) continue;
                if(!this.options[key].percentage) this.options[key].percentage = 0;
                if(~this.options[key].contains.indexOf(v.name)){
                    let score = self.baseScore * this.options[key].percentage;
                    v.score += score;
                    v.reasons.push(`符合酒店第${key}级别标准+${score}`);
                }else {
                    v.reasons.push(` 不符合酒店第${key}级别标准+0`);
                }
            }
            return v;
        })
        return hotels;
    }

}

export = HotelBrandPrefer;