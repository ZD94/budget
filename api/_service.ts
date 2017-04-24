/**
 * Created by wlh on 2017/3/14.
 */

'use strict';

import {Budget} from "_type/budget";
import {createServerService} from "../common/model/sequelize";
import {ModelsInterface, Models} from "../_type/index";

export function initModels(models: ModelsInterface){
    for(let k in models){
        if(Models[k])
            Models[k].setTarget(models[k]);
    }
}

initModels({
    budget: createServerService<Budget>(Budget),
});
