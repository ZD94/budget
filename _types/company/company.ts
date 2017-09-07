import {Models} from '_types';
import { Types, Values } from 'common/model';
import {Table, Create, Field, ResolveRef, RemoteCall} from 'common/model/common';
import { ModelObject } from 'common/model/object';


@Table(Models.company, "company.company")
export class Company extends ModelObject{
    constructor(target: Object) {
        super(target);
    }

    @Create()
    static create(obj?: Object): Company { return null; }

    @Field({type: Types.UUID})
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) {}

    @Field({type: Types.STRING})
    get name():string { return null;}
    set name(val: string) {}

    @Field({type: Types.BOOLEAN})
    get isUploadInvoice(): boolean { return null; }
    set isUploadInvoice(val: boolean) {}

    @Field({type: Types.BOOLEAN})
    get isOpenSubsidyBudget(): boolean { return null; }
    set isOpenSubsidyBudget(val: boolean) {}
}