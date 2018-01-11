import { Models } from '_types';
import { Types, Values } from 'common/model';
import { Table, Create, Field, ResolveRef, RemoteCall } from 'common/model/common';
import { ModelObject } from 'common/model/object';



// 该表的唯一性由  自身的 id 和 regionId 构成， 两者决定了一条travelPolicyRegion
//
@Table(Models.aircompany, "static.aircompanies")
export class AirCompany extends ModelObject {
    constructor(target: Object) {
        super(target);
    }

    @Create()
    static create(obj?: Object): AirCompany { return null; }

    @Field({ type: Types.STRING(2) })
    get id(): string { return null; }
    set id(val: string) { }

    @Field({type: Types.STRING(100)})
    get name(): string { return null }
    set name(name: string) { }

    @Field({type: Types.TEXT})
    get logo(): string { return null; }
    set logo(logo: string) { }
}