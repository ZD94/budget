/**
 * Created by wlh on 2017/3/14.
 */

'use strict';

import {Budget, BudgetItem} from "_types/budget";
import {App, Statistic} from "_types/openapi";
import {Supplier} from "_types/supplier"
import {createServerService} from "../common/model/sequelize";
import {ModelsInterface, Models} from "../_types/index";

export function initModels(models: ModelsInterface){
    for(let k in models){
        if(Models[k])
            Models[k].setTarget(models[k]);
    }
}

initModels({
    budget: createServerService<Budget>(Budget),
    budgetItem: createServerService<BudgetItem>(BudgetItem),
    app: createServerService<App>(App),
    statistic: createServerService<Statistic>(Statistic),
    supplier: createServerService<Supplier>(Supplier)
});
