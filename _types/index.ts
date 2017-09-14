/**
 * Created by wlh on 2017/3/10.
 */

'use strict';
import {ModelInterface} from "../common/model/interface";
import {ModelDelegate} from "../common/model/delegate";
import {Budget, BudgetItem} from "_types/budget";
import {Statistic, App} from "_types/openapi";
import {TravelPolicy,SubsidyTemplate, TravelPolicyRegion, CompanyRegion, RegionPlace} from "_types/policy";
import {CurrencyRate, Currency} from "_types/currency";

export interface ModelsInterface {
    budget: ModelInterface<Budget>;
    budgetItem: ModelInterface<BudgetItem>;
    app: ModelInterface<App>,
    statistic: ModelInterface<Statistic>,
    travelPolicy: ModelInterface<TravelPolicy>;
    travelPolicyRegion: ModelInterface<TravelPolicyRegion>;
    companyRegion: ModelInterface<CompanyRegion>;
    regionPlace: ModelInterface<RegionPlace>;
    subsidyTemplate: ModelInterface<SubsidyTemplate>;
    currencyRate: ModelInterface<CurrencyRate>;
    currency: ModelInterface<Currency>;
}




export var Models: ModelsInterface = {
    budget: new ModelDelegate<Budget>(),
    budgetItem: new ModelDelegate<BudgetItem>(),
    travelPolicy: new ModelDelegate<TravelPolicy>(),
    travelPolicyRegion: new ModelDelegate<TravelPolicyRegion>(),
    companyRegion: new ModelDelegate<CompanyRegion>(),
    regionPlace: new ModelDelegate<RegionPlace>(),
    subsidyTemplate: new ModelDelegate<SubsidyTemplate>(),
    app: new ModelDelegate<App>(),
    statistic: new ModelDelegate<Statistic>(),
    currencyRate: new ModelDelegate<CurrencyRate>(),
    currency: new ModelDelegate<Currency>(),
};

