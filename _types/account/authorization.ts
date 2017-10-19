import { Models } from '_types';
import { Types, Values } from 'common/model';
import { Table, Create, Field, ResolveRef, RemoteCall } from 'common/model/common';
import { ModelObject } from 'common/model/object';
let uuid = require("uuid");

@Table(Models.authorization, "auth.authorization")
export class Authorization extends ModelObject {
  constructor(target: Object) {
    super(target);
  }

  @Create()
  static create(obj?: Object): Authorization { return null }

  @Field({ type: Types.UUID })
  get id() { return uuid.v1() }
  set id(id) { }

  @Field({ type: Types.UUID })
  get agent() { return null }
  set agent(agent: string) { }

  @Field({ type: Types.UUID })
  get company() { return null }
  set company(company: string) { }

  @Field({ type: Types.INTEGER })
  get status() { return null }
  set status(status: number) { }


}