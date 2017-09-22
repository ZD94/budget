import {Models} from '_types';
import { Types, Values } from 'common/model';
import {Table, Create, Field, ResolveRef, RemoteCall} from 'common/model/common';
import { ModelObject } from 'common/model/object';
import {RegionPlace} from "./regionPlace"
import {TravelPolicy} from "./travelPolicy";

export enum ECompanyRegionGroup {
    CHINESE_MAINLAND = 1,
    OVERSEAS = 2,
}
export enum ECompanyRegionUsedType {
    TRAVEL_POLICY = 1,
    SUBSIDY = 2,
    CITY_PRICE_LIMIT = 3,
}

@Table(Models.companyRegion, "travelPolicy.companyRegion")
export class CompanyRegion extends ModelObject{
    constructor(target: Object) {
        super(target);
    }

    @Create()
    static create(obj?: Object): CompanyRegion { return null; }

    @Field({type: Types.UUID})
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) {}

    @Field({type: Types.STRING})
    get name():string { return null;}
    set name(val: string) {}

    //所属差旅标准
    @Field({type: Types.UUID})
    get companyId(): string { return null; }
    set companyId(val: string) {}

    @Field({type: Types.INTEGER, defaultValue: ECompanyRegionGroup.CHINESE_MAINLAND})
    get group(): ECompanyRegionGroup { return ECompanyRegionGroup.CHINESE_MAINLAND; }
    set group(val: ECompanyRegionGroup) {}

    @Field({type: Types.JSONB})
    get types(): any { return null; }
    set types(val: any) {}

}
