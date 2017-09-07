/**
 * Created by wlh on 2017/3/10.
 */

'use strict';
import {ModelInterface} from "../common/model/interface";
import {ModelDelegate} from "../common/model/delegate";
import {Budget, BudgetItem} from "_types/budget";
import {Statistic, App} from "_types/openapi";
import {Supplier} from "./supplier";
import {Company} from "_types/company";
import {TravelPolicy,SubsidyTemplate, TravelPolicyRegion, CompanyRegion, RegionPlace} from "_types/policy";
import {Account, AccountCompany} from "_types/account";

export interface ModelsInterface {
    budget: ModelInterface<Budget>;
    budgetItem: ModelInterface<BudgetItem>;
    app: ModelInterface<App>,
    statistic: ModelInterface<Statistic>,
    supplier: ModelInterface<Supplier>
    travelPolicy: ModelInterface<TravelPolicy>;
    travelPolicyRegion: ModelInterface<TravelPolicyRegion>;
    companyRegion: ModelInterface<CompanyRegion>;
    regionPlace: ModelInterface<RegionPlace>;
    subsidyTemplate: ModelInterface<SubsidyTemplate>;
    company: ModelInterface<Company>;
    account: ModelInterface<Account>;
    accountCompany: ModelInterface<AccountCompany>;
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
    supplier: new ModelDelegate<Supplier>(),
    company: new ModelDelegate<Company>(),
    account: new ModelDelegate<Account>(),
    accountCompany: new ModelDelegate<AccountCompany>()
};

