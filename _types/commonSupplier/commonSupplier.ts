'use strict';

import {Table, Create, Field} from "common/model/common";
import {Models} from '_types';
import {Types, Values} from 'common/model';
import {ModelObject} from 'common/model/object';


@Table(Models.commonSupplier, 'supplier.')
export class CommonSupplier extends ModelObject{
    constructor(target: Object) {
        super(target);
    }
    @Create()
    static create(obj?: Object): CommonSupplier { return null; }

    @Field({type: Types.UUID})
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) {}

    // 供应商名称
    @Field({type: Types.STRING})
    get name(): string { return null; }
    set name(val: string) {}

    // 别名
    @Field({type: Types.STRING})
    get alias(): string { return null; }
    set alias(val: string) {}

    // 供应商logo
    @Field({type: Types.STRING})
    get logo(): string { return null; }
    set logo(val: string) {}



}
