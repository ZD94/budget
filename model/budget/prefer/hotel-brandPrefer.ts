/**
 * Created by wlh on 16/8/15.
 */

'use strict';
import { IFinalHotel, EHotelStar } from "./interface";
import { AbstractPrefer } from "./AbstractPrefer";
/**
 * @method 符合指定品牌酒店，进行打分
 * @params.category 支持两种模式[{contains: [], percentage: 30},{contains: [], percentage: 20}] 
 *       或者{1: {contains: [], percentage: 30}, 2: {contains: [], percentage: 30}}
 */
class HotelBrandPrefer extends AbstractPrefer<IFinalHotel> {

    private options: any;
    private baseScore: number;
    private category: any;

    constructor(name, options) {
        super(name, options);
        if (!this.baseScore) this.baseScore = 0;
        if(!this.category) this.category = null;
        if (!this.options) {
            this.options = null;
        }
    }

    async markScoreProcess(hotels: IFinalHotel[]): Promise<IFinalHotel[]> {
        let self = this;
        if(!this.category) return hotels;
        if(!this.baseScore) return hotels;

        hotels = hotels.map((v) => {
            if (!v.score) v.score = 0;
            if (!v.reasons) v.reasons = [];
           
            for(let key in this.category){
                if(!this.category[key] || !this.category[key].contains || !this.category[key].contains.length) continue;
                if(!this.category[key].percentage || this.category[key].percentage < 0 || this.category[key].percentage > 100)
                    this.category[key].percentage = 0;
       
                let i = 0;
                for( ; i < this.category[key].contains.length; i++) {
                    if(v.name && v.name.length >0 && ~v.name.indexOf(this.category[key].contains[i])){
                        let score = self.baseScore * this.category[key].percentage;
                        v.score += score;
                        v.reasons.push(`符合酒店第${key}级别标准+${score}`);
                        break;
                    } 
                }
                if(i >= this.category[key].contains.length) {
                    v.reasons.push(` 不符合酒店第${key}级别标准+0`);
                }
            }
            return v;
        })
        return hotels;
    }

}

export = HotelBrandPrefer;