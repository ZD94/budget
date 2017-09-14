import {Models} from '_types';
import { Types, Values } from 'common/model';
import {Table, Create, Field, ResolveRef, RemoteCall} from 'common/model/common';
import { ModelObject } from 'common/model/object';


@Table(Models.accountCompany, "auth.accountCompany")
export class AccountCompany extends ModelObject{
    constructor(target: Object) {
        super(target);
    }

    @Create()
    static create(obj?: Object): AccountCompany { return null; }

    @Field({type: Types.UUID})
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) {}

    @Field({type: Types.UUID})
    get accountId():string { return null;}
    set accountId(val: string) {}

    @Field({type: Types.UUID})
    get companyId():string { return null;}
    set companyId(val: string) {}
}