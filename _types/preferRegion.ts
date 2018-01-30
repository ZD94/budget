/**
 * Created by hxs on 2017/8/29.
 */

'use strict';
import { Models } from "./index";
import { ModelObject } from "common/model/object";
import { uuid } from "uuid";
import { Types, Values } from 'common/model';
import { Table, Create, Field, ResolveRef, RemoteCall } from 'common/model/common';
import { CompanyRegion } from "./policy/companyRegion";

@Table(Models.preferRegion, "travelPolicy.preferRegion")
export class PreferRegion extends ModelObject {
    constructor(target: Object) {
        super(target)
    }

    @Create()
    static create(obj: any): PreferRegion { return null }

    //id 为company_region_id
    @Field({ type: Types.UUID })
    get id() { return Values.UUIDV1() }
    set id(id: string) { }

    @Field({ type: Types.JSONB, defaultValue: '{}' })
    get budgetConfig(): any { return {} };
    set budgetConfig(conf: any) { }
}