/**
 * Created by wlh on 2017/3/10.
 */

'use strict';
import {ModelInterface} from "../common/model/interface";
import {ModelDelegate} from "../common/model/delegate";
import {Budget, BudgetItem} from "_types/budget";
import {Statistic, App} from "_types/openapi";
import {TravelPolicy,SubsidyTemplate, TravelPolicyRegion, CompanyRegion, RegionPlace, SubsidyType, PolicyRegionSubsidy} from "_types/policy";
import {CompanySetingInfo} from "./companySetingInfo";
import {Prefer} from "./prefer";

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
    subsidyType: ModelInterface<SubsidyType>;
    policyRegionSubsidy: ModelInterface<PolicyRegionSubsidy>;
    companySetingInfo: ModelInterface<CompanySetingInfo>;
    prefer: ModelInterface<Prefer>;
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
    subsidyType: new ModelDelegate<SubsidyType>(),
    policyRegionSubsidy: new ModelDelegate<PolicyRegionSubsidy>(),
    companySetingInfo: new ModelDelegate<CompanySetingInfo>(),
    prefer: new ModelDelegate<Prefer>(),
};

