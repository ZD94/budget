/**
 * Created by wlh on 2017/3/10.
 */

'use strict';
import {ModelInterface} from "../common/model/interface";
import {ModelDelegate} from "../common/model/delegate";
import {App} from "./app";
import {Budget} from "_type/budget";

export interface ModelsInterface {
    app: ModelInterface<App>;
    budget: ModelInterface<Budget>;
}

export var Models: ModelsInterface = {
    app: new ModelDelegate<App>(),
    budget: new ModelDelegate<Budget>(),
};

