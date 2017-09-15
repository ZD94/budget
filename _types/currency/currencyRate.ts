import {Models} from '_types';
import { Types, Values } from 'common/model';
import {Table, Create, Field, ResolveRef, RemoteCall} from 'common/model/common';
import { ModelObject } from 'common/model/object';

@Table(Models.currencyRate, "currency.currencyRate")
export class CurrencyRate extends ModelObject{
    constructor(target: Object) {
        super(target);
    }

    @Create()
    static create(obj?: Object): CurrencyRate { return null; }

    @Field({type: Types.UUID})
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) {}

    @Field({type: Types.STRING})
    get currencyFrom():string { return null;}
    set currencyFrom(val: string) {}

    @Field({type: Types.STRING})
    get currencyTo(): string { return null; }
    set currencyTo(val: string) {}

    @Field({type: Types.DATE})
    get postedAt(): Date { return null; }
    set postedAt(val: Date) {}


    @Field({type: Types.NUMERIC})
    get rate(): number { return null;}
    set rate(val: number) {}

}