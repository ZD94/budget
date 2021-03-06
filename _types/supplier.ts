/**
 * Created by mr_squirrel on 29/08/2017.
 */

'use strict';

import {Table, Create, Field} from "../common/model/common";
import _ = require('lodash');
import {Models} from '_types';
import {Types, Values} from 'common/model';
import {ModelObject} from 'common/model/object';



var API = require("@jingli/dnode-api");
if (API.default) {
    API = API.default
}

export enum ESupplierType {
    COMPANY_CUSTOM = 1,
    SYSTEM_CAN_IMPORT = 2,
    SYSTEM_CAN_NOT_IMPORT = 3
}

@Table(Models.supplier, 'company.')
export class Supplier extends ModelObject{
    constructor(target: Object) {
        super(target);
    }
    @Create()
    static create(obj?: Object): Supplier { return null; }

    @Field({type: Types.UUID})
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) {}

    //类型
    @Field({type: Types.INTEGER, defaultValue: ESupplierType.COMPANY_CUSTOM})
    get type(): ESupplierType { return ESupplierType.COMPANY_CUSTOM; }
    set type(val: ESupplierType) {}

    // 供应商名称
    @Field({type: Types.STRING})
    get name(): string { return null; }
    set name(val: string) {}

    // 交通预定链接
    @Field({type: Types.STRING})
    get trafficBookLink(): string { return null; }
    set trafficBookLink(val: string) {}

    // 酒店预定链接
    @Field({type: Types.STRING})
    get hotelBookLink(): string { return null; }
    set hotelBookLink(val: string) {}

    // 供应商logo
    @Field({type: Types.STRING})
    get logo(): string { return null; }
    set logo(val: string) {}

    // 是否使用
    @Field({type: Types.BOOLEAN})
    get isInUse(): boolean { return true; }
    set isInUse(val: boolean) {}

    // 拉取关联订单使用的供应商key
    @Field({type: Types.STRING})
    get supplierKey(): string { return null; }
    set supplierKey(val: string) {}

    // 公司ID
    @Field({type: Types.UUID})
    get companyId(): string { return Values.UUIDV1(); }
    set companyId(val: string) {}



}
