import { ICity } from './interface';
import * as L from "@jingli/language";

/**
 * Created by wlh on 2018/3/8.
 */

'use strict';
var config = require("@jingli/config");

export interface IPrefer<T> {
    markScore(tickets: T[]): Promise<T[]>;
}

export abstract class AbstractPrefer<T> implements IPrefer<T> {
    constructor(public name: string, options: any) {
        if (options) {
            for (let k in options) {
                this[k] = options[k];
            }
        }
    }
    abstract async markScoreProcess(data: T[]): Promise<T[]>;
    async markScore(data: T[]): Promise<T[]> {
        // logger.info(`. BEGIN ${this.name}`);
        let ret = await this.markScoreProcess(data);
        // logger.info(`. END ${this.name}`);
        return ret;
    }
}

