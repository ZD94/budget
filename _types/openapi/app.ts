

import {ModelObject} from "common/model/object";
import {Table, Create, Field} from "common/model/common";
import {Models} from "_types/index";
import uuid = require("uuid");
import {Types} from "common/model/index";

@Table(Models.app, "openapi.")
export class App extends ModelObject {
    constructor(target: Object) {
        super(target);
    }

    @Create()
    static create(obj: any) : App { return null}

    //ID
    @Field({type: Types.UUID})
    get id() : string { return uuid.v1()}
    set id(id: string) {}

    //名称
    @Field({type: Types.STRING(50)})
    get name(): string { return null}
    set name(name: string) {}

    //秘钥
    @Field({type: Types.STRING(50)})
    get secretKey(): string { return ''}
    set secretKey(secretKey: string) {}

    //失效日期
    @Field({type: Types.DATE})
    get expireDate(): Date { return null}
    set expireDate(date: Date) {}

    //联系人
    @Field({type: Types.STRING(50)})
    get connectUser(): string { return null}
    set connectUser(connectUser: string) {}

    //联系方式
    @Field({type: Types.STRING(50)})
    get connectMobile() : string { return null}
    set connectMobile(connectMobile: string) {}

    //接口请求次数配置
    @Field({type: Types.JSONB})
    get config(): any { return {}}
    set config(config: any) {}

    //偏好
    @Field({type: Types.JSONB})
    get preferConfig() : any { return {}}
    set preferConfig(preferConfig: any) {}

    @Field({type: Types.UUID})
    get agentId(): string { return null}
    set agentId(agentId: string) {}
}