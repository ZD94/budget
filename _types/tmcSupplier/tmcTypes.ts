'use strict';

import { Table, Create, Field } from "common/model/common";
import { Models } from '_types';
import { Types, Values } from 'common/model';
import { ModelObject } from 'common/model/object';

/* services */
export enum TmcServiceType {
    FLIGHT = 1,
    TRAIN = 2,
    HOTEL = 3,
    FLIGHT_ABROAD = 4,
    TRAIN_ABROAD = 5,
    HOTEL_ABROAD = 6
}


@Table(Models.tmcTypes, 'tmc.')
export class TmcTypes extends ModelObject {
    constructor(target: Object) {
        super(target);
    }
    @Create()
    static create(obj?: Object): TmcTypes { return null; }

    @Field({ type: Types.UUID })
    get id(): string { return Values.UUIDV1(); }
    set id(val: string) { }

    @Field({ type: Types.STRING })
    get name(): string { return null; }
    set name(val: string) { }

    @Field({ type: Types.STRING })
    get tmcName(): string { return null; }
    set tmcName(val: string) { }

    @Field({ type: Types.STRING })
    get sname(): string { return null; }
    set sname(val: string) { }

    @Field({ type: Types.JSON })
    get template(): any { return null; }
    set template(val: any) { }

    @Field({ type: Types.JSONB, defaultValue: '[]' })
    get services(): TmcServiceType[] { return null; }
    set services(val: TmcServiceType[]) { }

    @Field({ type: Types.STRING })
    get description(): string { return null; }
    set description(val: string) { }
}
