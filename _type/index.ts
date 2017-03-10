/**
 * Created by wlh on 2017/3/10.
 */

'use strict';
import {ModelInterface} from "../common/model/interface";
import {ModelDelegate} from "../common/model/delegate";
import {App} from "./app";

export interface ModelsInterface {
    app: ModelInterface<App>;
}

export var Models: ModelsInterface = {
    app: new ModelDelegate<App>(),
};

export function initModels(models: ModelsInterface){
    for(let k in models){
        if(Models[k])
            Models[k].setTarget(models[k]);
    }
}