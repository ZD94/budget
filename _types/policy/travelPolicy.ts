import {Models} from '_types';
// import {Staff} from '_types/staff';
// import { Company } from '_types/company';
import { Types, Values } from 'common/model';
import {Table, Create, Field, ResolveRef, RemoteCall} from 'common/model/common';
import { ModelObject } from 'common/model/object';
import {PaginateInterface} from 'common/model/interface';
import {CompanyRegion} from "_types/policy/companyRegion";
import {RegionPlace} from "_types/policy/regionPlace";
var _ = require("lodash");
const API = require("@jingli/dnode-api")
import {ECompanyRegionUsedType} from "./companyRegion";
import { ICity, CityService } from '_types/city';

export var  MTrainLevel  = {
    1: "商务座",
    2: "一等座",
    3: "二等座",
    4: '特等座',
    5: '高级软卧',
    6: '软卧',
    7: '硬卧',
    8: '软座',
    9: '硬座',
    10: '无座'
}

export enum ETrainLevel {
    // BUSINESS = 1,
    // FIRST_CLASS = 2,
    // SECOND_CLASS = 3,
    BUSINESS_SEAT = 1,
    FIRST_SEAT = 2,
    SECOND_SEAT = 3,
    PRINCIPAL_SEAT = 4,
    SENIOR_SOFT_SLEEPER = 5,
    SOFT_SLEEPER = 6,
    HARD_SLEEPER = 7,
    SOFT_SEAT = 8,
    HARD_SEAT = 9,
    NO_SEAT = 10,
}

export function enumTrainLevelToStr(trainLevels: ETrainLevel[]) :string {
    if (!trainLevels) return '';
    return trainLevels.map( (trainLevel) => {
        return MTrainLevel[trainLevel]
    }).join("、")
}

export var  MHotelLevel  = {
    5: "国际五星",
    4: "高端商务",
    3: "精品连锁",
    2: "快捷连锁"
}

export enum EHotelLevel {
    FIVE_STAR = 5,
    FOUR_STAR = 4,
    THREE_STAR = 3,
    TWO_STAR = 2
}

export function enumHotelLevelToStr(hotelLevels: EHotelLevel[]) :string {
    if (!hotelLevels) return '';
    return hotelLevels.map( (hotelLevel) => {
        return MHotelLevel[hotelLevel];
    }).join("、")
}

export function enumHotelsFormat(hotelLevels: EHotelLevel[]) :Array<{name: string, value: EHotelLevel}> {
    if (!hotelLevels) return [];
    return hotelLevels.map( (v) => {
        return {name: MHotelLevel[v], value: v};
    })
}

export var  MPlaneLevel  = {
    // 1: "公务舱/头等舱",
    2: "经济舱",
    3: '头等舱',
    4: '商务舱',
    5: '高端经济舱',
}

export enum EPlaneLevel {
    // BUSINESS_FIRST = 1,
    ECONOMY = 2,
    FIRST = 3,
    BUSINESS = 4,
    PREMIUM_ECONOMY = 5,    //高端经济仓
}

export var DefaultRegion = {
    domestic: '国内',
    abroad:  '国际'
}

export var DefaultRegionId = {
    domestic: '1814991',  //表示中国
    abroad:  '1'          //表示最顶级，为全球
}

export var TravelPolicyType = {
    hotel: 'hotelLevels',
    train: 'trainLevels',
    plane: 'placeLevels',
    maxPriceLimit: 'maxPriceLimit',
    minPriceLimit: 'minPriceLimit',
    hotelPrefer: 'hotelPrefer',
    trafficPrefer: 'trafficPrefer'
}

export var ForbiddenPlane = -1;
export var ForbiddenType = 'planeLevels';

export function enumPlaneLevelToStr(planeLevels: EPlaneLevel[]) :string {
    if (!planeLevels) return '';
    return planeLevels.map( (planeLevel) => {
        return MPlaneLevel[planeLevel];
    }).join('、')
}


@Table(Models.travelPolicy, "travelPolicy.")
export class TravelPolicy extends ModelObject{
    constructor(target: Object) {
        super(target);
    }
    @Create()
    static create(obj?: Object): TravelPolicy { return null; }

    @Field({type: Types.UUID})
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) {}

    @Field({type: Types.STRING(50)})
    get name(): string {return null}
    set name(name: string){}

    @Field({type: Types.BOOLEAN})
    get isChangeLevel(): boolean {return null}
    set isChangeLevel(isChangeLevel: boolean){}

    @Field({type: Types.BOOLEAN})
    get isDefault(): boolean {return false}
    set isDefault(isDefault: boolean){}

    // @ResolveRef({type: Types.UUID}, Models.company)
    // get company(): Company { return null; }
    // set company(val: Company) {}

    @Field({type: Types.UUID})
    get companyId(): string { return null;}
    set companyId(val: string) {}

    @Field({type: Types.BOOLEAN})
    get isOpenAbroad() : boolean { return false}
    set isOpenAbroad(b: boolean) {}

    // @RemoteCall()
    // async getStaffs(): Promise<PaginateInterface<Staff>> {
    //     let query = {where: {companyId: this.company.id, travelPolicyId: this.id}};
    //     let pager = await Models.staff.find(query);
    //     return pager;
    // }

    @RemoteCall()
    async getSubsidyTemplates(): Promise<SubsidyTemplate[]> {
        let query = { where: {travelPolicyId: this.id}};
        return Models.subsidyTemplate.find(query);
    }

    @RemoteCall()
    async getTravelPolicyRegions(id?: string) : Promise<TravelPolicyRegion[]> {
        let travelPolicyId = id ? id:this.id;
        return Models.travelPolicyRegion.find({where: {travelPolicyId: travelPolicyId}});
    }

    /*
     * 级联查询最优的差旅标准设置。
     * @param params
     * @param params.placeId 出差地
     * @param params.type 期望获取的差旅标准类型，如planeLevels, hotelLevels, trainLevels, trafficPrefer, maxPriceLimit等
     * @param params.companyRegionType 期望的地区类型，如差旅标准、补助、限价
     * return array|number|null
     *
     * 注意:
     *  舒适度：
     *       -1、null: 表示不设
     *       0-100：正常返回，无需往上找
     *  限价：
     *       null: 表示不设
     *       0-100：正常返回
     *
     */
    @RemoteCall()
    async getBestTravelPolicy(params: {placeId: string, type:string, companyRegionType: ECompanyRegionUsedType}):Promise<any> {
        let {placeId,type, companyRegionType} = params;
        let self = this;
        let placeid = placeId;
        let tprs = await Models.travelPolicyRegion.all({
            where: {travelPolicyId: self.id}
        });
        let crIds: string[] = [];
        for(let i =0; i <tprs.length; i++){
            if(tprs[i]["companyRegionId"] && typeof(tprs[i]['companyRegionId']) != 'undefined'){
                let crObj = await Models.companyRegion.get(tprs[i]['companyRegionId']);
                if(crObj && crObj['types'] && _.isArray(crObj['types']) && crObj['types'].indexOf(companyRegionType) >= 0) {
                    crIds.push(tprs[i]["companyRegionId"]);
                }
                if(crObj && !crObj['types']) {
                    crIds.push(tprs[i]["companyRegionId"]);
                }
            }
        }
        if(!crIds || crIds.length == 0) return getDefault(type);
        do {
            let cps = await self.getRegionPlaces({
                where: {companyRegionId: {$in: crIds}, placeId: placeid}});
            if(cps && cps.length ){
                let expectedTpr = await Models.travelPolicyRegion.find({where: {travelPolicyId: self.id,companyRegionId: cps[0]["companyRegionId"]}});
                if(type == ForbiddenType && expectedTpr && expectedTpr.length && expectedTpr[0]['allowPlane'] == false) {
                    return [ForbiddenPlane];
                }
                if(expectedTpr && expectedTpr.length && typeof(expectedTpr[0][type]) == 'number' && expectedTpr[0][type] >= 0){
                    return expectedTpr[0][type];
                }
                if(expectedTpr && expectedTpr.length && _.isArray(expectedTpr[0][type]) && expectedTpr[0][type] ){
                    return expectedTpr[0][type];
                }

            }
            let cityInfo = await CityService.getCity(placeid);
            if (!cityInfo) {
                return getDefault(type);
            }
            if(cityInfo.parentId) {
                placeid = cityInfo.parentId;
                continue;
            }

            if(!cityInfo.isAbroad)
                placeid = DefaultRegionId.domestic;   //
            if(cityInfo.isAbroad)
                placeid = DefaultRegionId.abroad;     //
            if(cityInfo.id == DefaultRegionId.domestic || cityInfo.id == DefaultRegionId.abroad) {
                return getDefault(type);
            }
        } while(placeid);

        function getDefault(type) {
            if(type == TravelPolicyType.maxPriceLimit) return 0;
            if(type == TravelPolicyType.minPriceLimit) return 0;
            if(type == TravelPolicyType.hotelPrefer) return -1;
            if(type == TravelPolicyType.trafficPrefer) return -1;
            return null;
        }
    }

    @RemoteCall()
    async getSubsidies(params: {placeId: string}):Promise<any> {
        let {placeId} = params;
        let self = this;
        let tprs = await Models.policyRegionSubsidy.all({
            where: {travelPolicyId: self.id}
        });
        let openedSupplierTypes = await Models.subsidyType.find({where: {companyId: self.companyId, isOpen: true}});
        let openedSupplierTypeIds = openedSupplierTypes.map((st) => {
            return st.id;
        })

        if(tprs && tprs.length){
            let crIds: string[] = [];
            for(let i =0; i <tprs.length; i++){
                if(crIds.indexOf(tprs[i]["companyRegionId"]) == -1){
                    crIds.push(tprs[i]["companyRegionId"]);
                }
            }
            do {
                let cps = await self.getRegionPlaces({
                    where: {companyRegionId: {$in: crIds}, placeId: placeId}});
                if(cps && cps.length ){
                    let expectedTpr = await Models.policyRegionSubsidy.all({where: {travelPolicyId: self.id,companyRegionId: cps[0]["companyRegionId"], subsidyTypeId: openedSupplierTypeIds}});
                    if(expectedTpr && expectedTpr.length){
                        return expectedTpr;
                    }else{
                        return null
                    }
                }
                let cityInfo = await CityService.getCity(placeId);
                if (!cityInfo) {
                    return null;
                }
                if(cityInfo.parentId) {
                    placeId = cityInfo.parentId;
                    continue;
                }

                if(!cityInfo.isAbroad)
                    placeId = DefaultRegionId.domestic;
                if(cityInfo.isAbroad)
                    placeId = DefaultRegionId.abroad;
            } while(placeId);
        }else{
            return null;
        }

    }


    async getRegionPlaces(params): Promise<RegionPlace[]>{
        return Models.regionPlace.find(params);
    }

}

@Table(Models.travelPolicyRegion, "travelPolicy.")
export class TravelPolicyRegion extends ModelObject{
    constructor(target: Object) {
        super(target);
    }
    @Create()
    static create(obj?: Object): TravelPolicyRegion { return null; }

    @Field({type: Types.UUID})
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) {}

    // @Field({type: Types.STRING(30)})
    // get regionId(): string { return null; }
    // set regionId(val: string) {}

    //所属差旅标准
    // @ResolveRef({type: Types.UUID}, Models.travelPolicy)
    // get travelPolicy(): TravelPolicy { return null; }
    // set travelPolicy(val: TravelPolicy) {}

    @ResolveRef({type: Types.UUID}, Models.travelPolicy)
    get travelPolicy(): TravelPolicy { return Values.UUIDV1(); }
    set travelPolicy(val: TravelPolicy) {}


    // @ResolveRef({type: Types.UUID}, Models.companyRegion)
    // get companyRegion(): CompanyRegion { return null; }
    // set companyRegion(val: CompanyRegion) {}


    @ResolveRef({type: Types.UUID}, Models.companyRegion)
    get companyRegion(): CompanyRegion { return Values.UUIDV1(); }
    set companyRegion(val: CompanyRegion) {}

    @Field({type: Types.ARRAY(Types.INTEGER)})
    get planeLevels(): EPlaneLevel[] {return null}
    set planeLevels(val: EPlaneLevel[]){}

    @Field({type: Types.ARRAY(Types.INTEGER)})
    get trainLevels(): ETrainLevel[] {return null}
    set trainLevels(val: ETrainLevel[]){}

    @Field({type: Types.ARRAY(Types.INTEGER)})
    get hotelLevels(): EHotelLevel[] {return null}
    set hotelLevels(val: EHotelLevel[]){}

    // @Field({type: Types.DOUBLE})
    // get planeDiscount(): number{return null}
    // set planeDiscount(planeDiscount: number){}

    //设置交通偏好
    @Field({type: Types.INTEGER, defaultValue: 50})
    get trafficPrefer(): number { return 50 }
    set trafficPrefer(trafficPrefer: number){}

    //设置住宿偏好
    @Field({type: Types.INTEGER, defaultValue: 50})
    get hotelPrefer(): number { return 50 }
    set hotelPrefer(hotelPrefer: number){}

    @Field({type: Types.INTEGER})
    get minPriceLimit(): number { return null;}
    set minPriceLimit(val:number) {}

    @Field({type: Types.INTEGER})
    get maxPriceLimit():number {return null;}
    set maxPriceLimit(val: number) {}

    @Field({type: Types.BOOLEAN})
    get allowPlane():boolean {return null;}
    set allowPlane(val: boolean) {}

}

@Table(Models.subsidyTemplate, "travelPolicy.")
export class SubsidyTemplate extends ModelObject{
    constructor(target: Object) {
        super(target);
    }
    @Create()
    static create(obj?: Object): SubsidyTemplate { return null; }

    @Field({type: Types.UUID})
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) {}

    //补助金额
    @Field({type: Types.NUMERIC(15, 2)})
    get subsidyMoney(): number{return null}
    set subsidyMoney(value: number){}

    //模板名称
    @Field({type: Types.STRING(50)})
    get name(): string { return null; }
    set name(val: string) {}

    //所属差旅标准
    @ResolveRef({type: Types.UUID}, Models.travelPolicy)
    get travelPolicy(): TravelPolicy { return null; }
    set travelPolicy(val: TravelPolicy) {}

    // @Field({type: Types.UUID})
    // get travelPolicyId(): string { return null; }
    // set travelPolicyId(val: string) {}


    @Field({type: Types.BOOLEAN})
    get isInternal() { return false;}
    set isInternal(b: boolean) {}
}