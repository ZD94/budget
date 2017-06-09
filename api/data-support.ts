/**
 * Created by wlh on 2017/6/9.
 */

'use strict';
import API from '@jingli/dnode-api';

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
            result = await API['dtask_mgr'].runTask({name: name, input: params}) as T[];
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