/**
 * Created by wlh on 2017/3/10.
 */

'use strict';
import {ModelInterface} from "../common/model/interface";
import {ModelDelegate} from "../common/model/delegate";
export interface ModelsInterface {
    app: ModelInterface<App>;
    budget: ModelInterface<Budget>;
}

export var Models: ModelsInterface = {
    app: new ModelDelegate<App>(),
    budget: new ModelDelegate<Budget>(),
};

import {App} from "./app";
import {Budget} from "./budget";
import {createServerService} from "../common/model/sequelize";

export function initModels(models: ModelsInterface){
    for(let k in models){
        if(Models[k])
            Models[k].setTarget(models[k]);
    }
}

initModels({
    app:createServerService<App>(App),
    budget: createServerService<Budget>(Budget),
});
