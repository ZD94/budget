/**
 * Created by wlh on 2017/3/10.
 */

'use strict';
import {ModelInterface} from "../common/model/interface";
import {ModelDelegate} from "../common/model/delegate";
import {Budget, BudgetItem} from "_types/budget";
import {Statistic, App} from "_types/openapi";
import {Supplier} from "./supplier";
export interface ModelsInterface {
    budget: ModelInterface<Budget>,
    budgetItem: ModelInterface<BudgetItem>,
    app: ModelInterface<App>,
    statistic: ModelInterface<Statistic>,
    supplier: ModelInterface<Supplier>
}

export var Models: ModelsInterface = {
    budget: new ModelDelegate<Budget>(),
    budgetItem: new ModelDelegate<BudgetItem>(),
    app: new ModelDelegate<App>(),
    statistic: new ModelDelegate<Statistic>(),
    supplier: new ModelDelegate<Supplier>()
};

