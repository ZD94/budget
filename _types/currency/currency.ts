import {Models} from '_types';
import { Types, Values } from 'common/model';
import {Table, Create, Field, ResolveRef, RemoteCall} from 'common/model/common';
import { ModelObject } from 'common/model/object';

@Table(Models.currency, "currency.currency")
export class Currency extends ModelObject{
    constructor(target: Object) {
        super(target);
    }

    @Create()
    static create(obj?: Object): Currency { return null; }

    @Field({type: Types.UUID})
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) {}

    @Field({type: Types.STRING})
    get currencyCode():string { return null;}
    set currencyCode(val: string) {}

    @Field({type: Types.STRING})
    get currencyName(): string { return null; }
    set currencyName(val: string) {}

}