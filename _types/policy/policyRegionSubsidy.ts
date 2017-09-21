import {Models} from '_types';
import { Types, Values } from 'common/model';
import {Table, Create, Field, ResolveRef, RemoteCall} from 'common/model/common';
import { ModelObject } from 'common/model/object';
import { SubsidyType } from '_types/policy'
@Table(Models.policyRegionSubsidy, "travelPolicy.")
export class PolicyRegionSubsidy extends ModelObject{
    constructor(target: Object) {
        super(target);
    }

    @Create()
    static create(obj?: Object): PolicyRegionSubsidy { return null; }

    @Field({type: Types.UUID})
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) {}

    @Field({type: Types.NUMERIC(15, 2)})
    get subsidyMoney(): number{return null}
    set subsidyMoney(value: number){}

    @Field({type: Types.UUID})
    get companyRegionId(): string { return null; }
    set companyRegionId(val: string) {}

    @Field({type: Types.UUID})
    get travelPolicyId(): string { return null; }
    set travelPolicyId(val: string) {}

    @ResolveRef({type: Types.UUID}, Models.subsidyType)
    get subsidyType(): SubsidyType { return null; }
    set subsidyType(val: SubsidyType) {}

}
