import {Models} from '_types';
import { Types, Values } from 'common/model';
import {Table, Create, Field, ResolveRef, RemoteCall} from 'common/model/common';
import { ModelObject } from 'common/model/object';

@Table(Models.subsidyType, "travelPolicy")
export class SubsidyType extends ModelObject{
    constructor(target: Object) {
        super(target);
    }

    @Create()
    static create(obj?: Object): SubsidyType { return null; }

    @Field({type: Types.UUID})
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) {}

    @Field({type: Types.STRING})
    get name():string { return null;}
    set name(val: string) {}

    @Field({type: Types.UUID})
    get companyId(): string { return null; }
    set companyId(val: string) {}

    @Field({type: Types.INTEGER, defaultValue: 1})
    get period(): number { return 1; }
    set period(val: number) {}

    @Field({type: Types.BOOLEAN, defaultValue: false})
    get isOpen(): boolean { return false; }
    set isOpen(val: boolean) {}

}
