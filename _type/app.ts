/**
 * Created by wlh on 2017/3/10.
 */

'use strict';
import {ModelObject} from "../common/model/object";
import {Models} from "./index";
import {Table, Field, Create} from "../common/model/common";
import uuid = require("uuid");
import {Types} from "../common/model/index";

@Table(Models.app, "openapi.apps")
export class App extends ModelObject {

    constructor(target: Object) {
        super(target);
    }

    @Create()
    static create() :App { return null}

    @Field({type: Types.UUID})
    get id() :string { return uuid.v1()}
    set id(id: string) {}

    @Field({type: Types.STRING(50)})
    get key() :string {return null}
    set key(key: string) {}

    @Field({type: Types.STRING(50)})
    get name() :string { return null}
    set name(name: string) {}

    @Field({type: Types.TEXT})
    get ip(): string { return null}
    set ip(ip: string) {}
}