'use strict';

import {Table, Create, Field, ResolveRef} from "common/model/common";
import {Models} from '_types';
import {Types, Values} from 'common/model';
import {ModelObject} from 'common/model/object';
import { CommonSupplier } from '_types/commonSupplier'


@Table(Models.supplierAlternateName, 'supplier.')
export class SupplierAlternateName extends ModelObject{
    constructor(target: Object) {
        super(target);
    }
    @Create()
    static create(obj?: Object): SupplierAlternateName { return null; }

    @Field({type: Types.UUID})
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) {}

    // 供应商id
    @ResolveRef({type: Types.UUID}, Models.commonSupplier)
    get commonSupplier(): CommonSupplier { return null; }
    set commonSupplier(val: CommonSupplier) {}

    // 类型
    @Field({type: Types.STRING})
    get type(): string { return null; }
    set type(val: string) {}

    @Field({type: Types.STRING})
    get value(): string { return null; }
    set value(val: string) {}
}
