/**
 * Created by wlh on 2017/5/11.
 */

'use strict';

import {ModelObject} from "common/model/object";
import {Table, Create, Field} from "common/model/common";
import {Models} from "_types/index";
import uuid = require("uuid");
import {Types} from "common/model/index";

@Table(Models.statistic, "openapi.")
export class Statistic extends ModelObject {
    constructor(target: Object) {
        super(target);
    }

    @Create()
    static create(obj: any) : Statistic { return null}

    //ID
    @Field({type: Types.UUID})
    get id() : string { return uuid.v1()}
    set id(id: string) {}

    //appid
    @Field({type: Types.UUID, index: true})
    get appid(): string { return null}
    set appid(appid: string) {}

    //根据日期统计
    @Field({type: Types.STRING(10), index: true})
    get day(): string { return null}
    set day(day: string) {}

    @Field({type: Types.BIGINT})
    get num(): number {return 0}
    set num(num: number) {}

    @Field({type: Types.STRING(255)})
    get url(): string {return null}
    set url(url: string) {}
}