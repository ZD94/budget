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
    domestic: 'CTW_5',
    abroad:  'Global'
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

    @RemoteCall()
    async getBestTravelPolicy(params: {placeId: string, type:string}):Promise<any> {
        let {placeId,type} = params;
        let self = this;
        let placeid = placeId;
        let tprs = await Models.travelPolicyRegion.all({
            where: {travelPolicyId: self.id}
        });
        let crIds: string[] = [];
        for(let i =0; i <tprs.length; i++){
            crIds.push(tprs[i]["companyRegionId"]);
        }
        do {
            let cps = await self.getRegionPlaces({
                where: {companyRegionId: {$in: crIds}, placeId: placeid}});
            if(cps && cps.length ){
                let expectedTpr = await Models.travelPolicyRegion.find({where: {travelPolicyId: self.id,companyRegionId: cps[0]["companyRegionId"]}});
                if(expectedTpr && expectedTpr.length && expectedTpr[0][type]){
                    return expectedTpr[0][type];
                }

            }
            let cityInfo = await API.place.getCityInfo({cityCode: placeid});
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
    @Field({type: Types.INTEGER})
    get trafficPrefer(): number { return -1 }
    set trafficPrefer(trafficPrefer: number){}

    //设置住宿偏好
    @Field({type: Types.INTEGER})
    get hotelPrefer(): number { return -1 }
    set hotelPrefer(hotelPrefer: number){}

    @Field({type: Types.INTEGER})
    get minPriceLimit(): number { return null;}
    set minPriceLimit(val:number) {}

    @Field({type: Types.INTEGER})
    get maxPriceLimit():number {return null;}
    set maxPriceLimit(val: number) {}

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