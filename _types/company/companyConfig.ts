import {Models} from '_types';
import { Types, Values } from 'common/model';
import {Table, Create, Field, ResolveRef, RemoteCall} from 'common/model/common';
import { ModelObject } from 'common/model/object';


@Table(Models.companyConfig, "company.companyConfig")
export class CompanyConfig extends ModelObject{
    constructor(target: Object) {
        super(target);
    }

    @Create()
    static create(obj?: Object): CompanyConfig { return null; }

    @Field({type: Types.UUID})
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) {}

    @Field({type: Types.BOOLEAN, defaultValue: false})
    get openExpiredBudget(): boolean { return false; }
    set openExpiredBudget(val: boolean) {}
}