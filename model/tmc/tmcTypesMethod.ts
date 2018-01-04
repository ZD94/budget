/*
 * @Author: Mr.He 
 * @Date: 2017-12-28 16:47:48 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2017-12-28 20:59:22
 * @content what is the content of this file. */

import { Models } from '_types';


export class TmcTypesMethod {
    async getAllTmcTypes(): Promise<any> {
        let tmcTypes = await Models.tmcTypes.all({});
        return tmcTypes;
    }
}

export let tmcTypesMethod = new TmcTypesMethod();