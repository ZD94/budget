import {Models} from '_types';
import { Types, Values } from 'common/model';
import {Table, TableIndex, Create, Field, ResolveRef, RemoteCall} from 'common/model/common';
import { ModelObject } from 'common/model/object';
let uuid = require("uuid");

export enum AccountType{
    OWNER = 0,
    MANAGER = 1
}

@Table(Models.account, "auth.")
export class Account extends ModelObject{
    constructor(target: Object) {
        super(target);
    }
    @Create()
    static create(obj?: Object): Account { return null; }

    @Field({type:Types.UUID})
    get id() { return uuid.v1(); }
    set id(id){}

    @Field({type:Types.STRING})
    get email(): string { return null; }
    set email(email: string){}

    @Field({type:Types.STRING})
    get mobile(): string { return null; }
    set mobile(mobile: string){}

    @Field({type:Types.STRING})
    get pwd(): string { return null; }
    set pwd(pwd: string){}

    //连续错误次数
    @Field({type:Types.INTEGER})
    get loginFailTimes(): number { return null; }
    set loginFailTimes(loginFailTimes: number){}

    //最近登录时间
    @Field({type:Types.DATE})
    get lastLoginAt(): Date { return null; }
    set lastLoginAt(lastLoginAt: Date ){}

    //最近登录Ip
    @Field({type:Types.STRING})
    get lastLoginIp(): string { return ''; }
    set lastLoginIp(lastLoginIp: string){}

    @Field({type:Types.INTEGER, defaultValue: AccountType.OWNER})
    get role(): AccountType { return AccountType.OWNER; }
    set role(type: AccountType){}

    @Field({type:Types.BOOLEAN})
    get isFirstLogin(): boolean { return true; }
    set isFirstLogin(isFirstLogin: boolean){}

}