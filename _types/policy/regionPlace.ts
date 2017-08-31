import {Models} from '_types';
import { Types, Values } from 'common/model';
import {Table, Create, Field, ResolveRef, RemoteCall} from 'common/model/common';
import { ModelObject } from 'common/model/object';
import {CompanyRegion} from "_types/policy/companyRegion";



// 该表的唯一性由  自身的 id 和 regionId 构成， 两者决定了一条travelPolicyRegion
//
@Table(Models.regionPlace, "travelPolicy.regionPlace")
export class RegionPlace extends ModelObject{
    constructor(target: Object){
        super(target);
    }

    @Create()
    static create(obj?: Object): RegionPlace { return null; }

    @Field({type: Types.UUID})
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) {}

    @Field({type: Types.STRING(30)})
    get placeId(): string { return null; }
    set placeId(val: string) {}

    @ResolveRef({type: Types.UUID}, Models.companyRegion)
    get companyRegion(): CompanyRegion { return null; }
    set companyRegion(val: CompanyRegion) {}

}