'use strict';

import { Table, Create, Field, ResolveRef } from "common/model/common";
import { Models } from '_types';
import { Types, Values } from 'common/model';
import { ModelObject } from 'common/model/object';
import { TmcTypes, TmcServiceType } from "./tmcTypes";
import { Company } from "_types/company";

export enum TMCStatus {
    NOT_CONNECT = 1,       //未开通，没有尝试过
    TEST = 2,              //测试中
    TEST_FAIL = 3,         //测试失败
    WAIT_USE = 4,          //等待启用， 测试通过，人工配置结束
    OK_USE = 5,            //正常使用
    STOP_USE = 6           //停用
}

export enum STARTWAY {
    AUTO = 1,    //配置成功后立即启用服务
    HAND = 2     //配置成功手动启用
}

export interface TmcSupplierService{
    type : TmcServiceType,
    status: TMCStatus,
    time: string
}

@Table(Models.tmcSupplier, 'tmc.')
export class TmcSupplier extends ModelObject {
    constructor(target: Object) {
        super(target);
    }
    @Create()
    static create(obj?: Object): TmcSupplier { return null; }

    @Field({ type: Types.UUID })
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) { }

    @Field({ type: Types.JSON })
    get identify(): any { return null; }
    set identify(val: any) { }

    @Field({ type: Types.STRING })
    get name(): string { return null; }
    set name(val: string) { }

    @Field({ type: Types.STRING })
    get status(): TMCStatus { return null; }
    set status(val: TMCStatus) { }

    @Field({ type: Types.STRING })
    get startWay(): STARTWAY { return null; }
    set startWay(val: STARTWAY) { }

    //启用的 飞机，火车，酒店
    @Field({ type: Types.INTEGER})
    get type(): number { return null; }
    set type(val:number) {}

    @ResolveRef({ type: Types.UUID }, Models.tmcTypes)
    get tmcType(): TmcTypes { return null; }
    set tmcType(val: TmcTypes) { }

    @ResolveRef({ type: Types.UUID }, Models.company)
    get company(): Company { return null; }
    set company(val: Company) { }
}
