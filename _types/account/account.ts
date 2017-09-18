import {Models} from '_types';
import { Types, Values } from 'common/model';
import {Table, TableIndex, Create, Field, ResolveRef, RemoteCall} from 'common/model/common';
import { ModelObject } from 'common/model/object';
let uuid = require("uuid");

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
}