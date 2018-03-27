/**
 * Created by wlh on 16/8/15.
 */

'use strict';
import { IFinalHotel, EHotelStar } from "./interface";
import { AbstractPrefer } from "./AbstractPrefer";
const _ = require("lodash");

const HOTEL_CATEGORY: {[index:string]: any} = {
    "1": {
        "baseScore": 0,
        "preference": 0,
        "contains":['康莱德', '香格里拉', 'JW万豪', '希尔顿', '万丽', '喜来登', '君悦']
    },
    "2": {
        "baseScore": 0,
        "preference": 0,
        "contains":['假日酒店', '全季酒店', '桔子水晶', '如家精选']
    },
    "3": { 
        "baseScore": 0,
        "preference": 0,
        "contains":['如家酒店', '汉庭', 'IBIS', '7天', '星程', '锦江之星', '布丁', '海友', '99旅馆', '速8']
    }
}

/**
 * @method 符合指定品牌酒店，进行打分 该算法支持企业自配酒店品牌等级或者使用默认的酒店等级
 * @return {Array<IFinalHotel>}
 * 
 * let result = {"name": "hotelBrand", "options": {"category": {
 *  "1": {
 *      "baseScore": 0,
 *      "contains": ['桔子水晶', '香格里拉'],   
 *      "preference": 0,   
 *      },
 *  "2": {
 *      "baseScore": 0,
 *      "contains": ['宿适精选酒店'],  
 *      "preference": 0
 * },
 *  "3": {
 *      "baseScore": 0, 
 *      "contains": ['金茂君悦'], 
 *      "preference": 0
 * }}}}
 */
class HotelBrandPrefer extends AbstractPrefer<IFinalHotel> {

    private options: any;
    private category: any;

    /**
     * @method
     * @param name 
     * @param options 
     */
    constructor(name, options) {
        super(name, options);
        if(!this.category) this.category = null;
        if (!this.options) {
            this.options = null;
        }
  
    }

    async markScoreProcess(hotels: IFinalHotel[]): Promise<IFinalHotel[]> {
        let self = this;
        if(!this.category) return hotels;
        for(let key in this.category){
            if(!this.category[key]["contains"] && !_.isArray(this.category[key]["contains"])){
                this.category[key]["contains"] = HOTEL_CATEGORY[key] && HOTEL_CATEGORY[key]["contains"] ? HOTEL_CATEGORY[key]['contains']: [];
            } 
            if(!this.category[key]['baseScore'] || !_.isNumber(this.category[key]['baseScore'])){
                this.category[key]['baseScore'] = HOTEL_CATEGORY[key] && HOTEL_CATEGORY[key]["baseScore"] ? HOTEL_CATEGORY[key]['baseScore']: 0;
            } 
            if(!this.category[key]['preference'] || !_.isNumber(this.category[key]['preference'])){
                this.category[key]['preference'] = HOTEL_CATEGORY[key] && HOTEL_CATEGORY[key]["preference"] ? HOTEL_CATEGORY[key]['preference']: 0;
            } 
        }

       

        hotels = hotels.map((v: IFinalHotel) => {
            if (!v.score) v.score = 0;
            if (!v.reasons) v.reasons = [];

            for(let key in this.category){
                if(!this.category[key] || !this.category[key]['contains'] 
                    || !this.category[key]['contains'].length) continue;
                if(!this.category[key]['preference'] || this.category[key]['preference'] <= 0 
                    || this.category[key]['preference'] > 100) continue;
                if(!this.category[key]['baseScore']) continue;
                        
                let i = 0;
                for( ; i < this.category[key]['contains'].length; i++) {
                    if(v.name && v.name.length >0 && ~v.name.indexOf(this.category[key]['contains'][i])){
                        let score = this.category[key]['baseScore'] * this.category[key]['preference'];
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