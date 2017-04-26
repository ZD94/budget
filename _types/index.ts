/**
 * Created by wlh on 2017/3/10.
 */

'use strict';
import {ModelInterface} from "../common/model/interface";
import {ModelDelegate} from "../common/model/delegate";
import {Budget} from "_types/budget";

export interface ModelsInterface {
    budget: ModelInterface<Budget>;
}

export var Models: ModelsInterface = {
    budget: new ModelDelegate<Budget>(),
};

