import {Models} from '_types';
import { Types, Values } from 'common/model';
import {Table, Create, Field, ResolveRef, RemoteCall} from 'common/model/common';
import { ModelObject } from 'common/model/object';

@Table(Models.companySetingInfo, "company.")
export class CompanySetingInfo extends ModelObject{
    constructor(target: Object) {
        super(target);
    }

    @Create()
    static create(obj?: Object): CompanySetingInfo { return null; }

    @Field({type: Types.UUID})
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) {}

    @Field({type: Types.UUID})
    get companyId(): string { return null; }
    set companyId(val: string) {}

    @Field({type: Types.BOOLEAN, defaultValue: false})
    get isUploadInvoice(): boolean { return false; }
    set isUploadInvoice(val: boolean) {}

    @Field({type: Types.BOOLEAN, defaultValue: false})
    get isOpenSubsidyBudget(): boolean { return false; }
    set isOpenSubsidyBudget(val: boolean) {}

}
