/**
 * Created by wlh on 2017/3/14.
 */

'use strict';

import {Budget, BudgetItem} from "_types/budget";
import {App, Statistic} from "_types/openapi";
import {createServerService} from "../common/model/sequelize";
import {ModelsInterface, Models} from "../_types/index";
import {TravelPolicy, TravelPolicyRegion, SubsidyTemplate, CompanyRegion, RegionPlace} from "_types/policy";

export function initModels(models: ModelsInterface){
    for(let k in models){
        if(Models[k])
            Models[k].setTarget(models[k]);
    }
}

initModels({
    budget: createServerService<Budget>(Budget),
    budgetItem: createServerService<BudgetItem>(BudgetItem),
    travelPolicy: createServerService<TravelPolicy>(TravelPolicy),
    travelPolicyRegion: createServerService<TravelPolicyRegion>(TravelPolicyRegion),
    companyRegion: createServerService<CompanyRegion>(CompanyRegion),
    regionPlace: createServerService<RegionPlace>(RegionPlace),
    subsidyTemplate: createServerService<SubsidyTemplate>(SubsidyTemplate),
    app: createServerService<App>(App),
    statistic: createServerService<Statistic>(Statistic),
});
