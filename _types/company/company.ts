import {Models} from '_types';
import { Types, Values } from 'common/model';
import {Table, Create, Field, ResolveRef, RemoteCall} from 'common/model/common';
import { ModelObject } from 'common/model/object';

export enum HotelPriceLimitType  {
    NO_SET = 0,
    Min_Price_Limit = -1,
    Max_Price_Limit = 1,
    Price_Limit_Both = 2
}

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

    //保存使用的公共供应商
    @Field({type: Types.JSONB, defaultValue: '[]'})
    get appointedPubilcSuppliers(): any { return []};
    set appointedPubilcSuppliers(val: any) {}

    @Field({type: Types.INTEGER, defaultValue: HotelPriceLimitType.NO_SET})
    get priceLimitType(): any { return HotelPriceLimitType.NO_SET};
    set priceLimitType(val: any) {}

    @Field({ type: Types.INTEGER })
    get type(): number { return null }
    set type(type: number) { }

    @Field({ type: Types.STRING })
    get appId(): string { return null }
    set appId(appId: string) { }

    @Field({ type: Types.STRING })
    get appSecret(): string { return null }
    set appSecret(appSecret: string) { }

}