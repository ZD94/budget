/**
 * Created by wlh on 2017/6/9.
 */

'use strict';
import API from '@jingli/dnode-api';
import Logger from '@jingli/logger';
var logger = new Logger("jibudget");

export abstract class AbstractDataSupport<T> {

    async getData(name: string| string[], params: Object) :Promise<T[]>{
        let names: string[] = []
        if (typeof name == 'string') {
            names.push(name);
        } else {
            names = name;
        }
        let result: T[];
        for(let name of names) {
            try {
                result = await API['dtask_mgr'].runTask({name: name, input: params}) as T[];
            } catch(err) {
                logger.error(`${name},${params}`, err);
            }
            if (result && result.length) {
                break;
            }
        }
        if (!result) {
            result = [];
        }
        return result;
    }
}