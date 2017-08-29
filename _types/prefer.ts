/**
 * Created by hxs on 2017/8/29.
 */

'use strict';
import {Models} from "./index";
import {ModelObject} from "common/model/object";
import {uuid} from "uuid";
import { Types, Values } from 'common/model';
import {Table, Create, Field, ResolveRef, RemoteCall} from 'common/model/common';
import {CompanyRegion} from "./policy/companyRegion";

@Table(Models.prefer, "prefer.")
export class Prefer extends ModelObject {
    constructor(target:Object) {
        super(target)
    }

    @Create()
    static create(obj: any) : Prefer {return null}

    @Field({type: Types.UUID})
    get id() { return Values.UUIDV1()}
    set id(id: string) {}

    @ResolveRef({type: Types.UUID}, Models.companyRegion)
    get companyRegion(): CompanyRegion { return null; }
    set companyRegion(val: CompanyRegion) {}

    @Field({type: Types.UUID})
    get travelPolicyId(): string { return null; }
    set travelPolicyId(val: string){}

    @Field({type: Types.JSONB, defaultValue: '{}'})
    get budgetConfig(): any { return {}};
    set budgetConfig(conf: any) {}
}