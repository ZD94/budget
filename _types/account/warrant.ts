import { v1 } from 'uuid'
import { Models } from '_types';
import { Types, Values } from 'common/model';
import { Table, Create, Field, ResolveRef, RemoteCall } from 'common/model/common';
import { ModelObject } from 'common/model/object';

@Table(Models.warrant, "auth.warrant")
export class Warrant extends ModelObject {
  constructor(target: Object) {
    super(target);
  }

  @Create()
  static create(obj?: Object): Warrant { return null }

  @Field({ type: Types.UUID })
  get id() { return v1() }
  set id(id) { }

  @Field({ type: Types.UUID })
  get proxy() { return null }
  set proxy(proxy: string) { }

  @Field({ type: Types.UUID })
  get company() { return null }
  set company(company: string) { }

  @Field({ type: Types.INTEGER })
  get status() { return null }
  set status(status: number) { }

  @Field({ type: Types.DATE })
  get createdAt(): Date { return null }
  set createdAt(createdAt: Date) { }
}