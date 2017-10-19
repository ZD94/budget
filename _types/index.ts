/**
 * Created by wlh on 2017/3/10.
 */

'use strict';

import { ModelInterface } from "../common/model/interface";
import { ModelDelegate } from "../common/model/delegate";
import { Budget, BudgetItem, Deeplink } from "_types/budget";
import { Statistic, App } from "_types/openapi";
import { TravelPolicy, SubsidyTemplate, TravelPolicyRegion, CompanyRegion, RegionPlace, SubsidyType, PolicyRegionSubsidy } from "_types/policy";
import { Supplier } from "./supplier";
import { Company } from "_types/company";
import { CurrencyRate, Currency } from "_types/currency";
import { Account, AccountCompany, Authorization } from "_types/account";
import { CompanyConfig } from "_types/company";
import { PreferRegion } from "./preferRegion";
import {CommonSupplier, SupplierAlternateName} from "_types/commonSupplier";

export interface ModelsInterface {
    budget: ModelInterface<Budget>;
    budgetItem: ModelInterface<BudgetItem>;
    deeplink: ModelInterface<Deeplink>;
    app: ModelInterface<App>,
    statistic: ModelInterface<Statistic>,
    supplier: ModelInterface<Supplier>
    travelPolicy: ModelInterface<TravelPolicy>;
    travelPolicyRegion: ModelInterface<TravelPolicyRegion>;
    companyRegion: ModelInterface<CompanyRegion>;
    regionPlace: ModelInterface<RegionPlace>;
    subsidyTemplate: ModelInterface<SubsidyTemplate>;
    subsidyType: ModelInterface<SubsidyType>;
    policyRegionSubsidy: ModelInterface<PolicyRegionSubsidy>;
    currencyRate: ModelInterface<CurrencyRate>;
    currency: ModelInterface<Currency>;
    company: ModelInterface<Company>;
    account: ModelInterface<Account>;
    accountCompany: ModelInterface<AccountCompany>;
    authorization: ModelInterface<Authorization>;
    preferRegion: ModelInterface<PreferRegion>;
    companyConfig: ModelInterface<CompanyConfig>;
    commonSupplier: ModelInterface<CommonSupplier>;
    supplierAlternateName: ModelInterface<SupplierAlternateName>;
}




export var Models: ModelsInterface = {
    budget: new ModelDelegate<Budget>(),
    budgetItem: new ModelDelegate<BudgetItem>(),
    deeplink: new ModelDelegate<Deeplink>(),
    travelPolicy: new ModelDelegate<TravelPolicy>(),
    travelPolicyRegion: new ModelDelegate<TravelPolicyRegion>(),
    companyRegion: new ModelDelegate<CompanyRegion>(),
    regionPlace: new ModelDelegate<RegionPlace>(),
    subsidyTemplate: new ModelDelegate<SubsidyTemplate>(),
    app: new ModelDelegate<App>(),
    statistic: new ModelDelegate<Statistic>(),
    subsidyType: new ModelDelegate<SubsidyType>(),
    policyRegionSubsidy: new ModelDelegate<PolicyRegionSubsidy>(),
    currencyRate: new ModelDelegate<CurrencyRate>(),
    currency: new ModelDelegate<Currency>(),
    supplier: new ModelDelegate<Supplier>(),
    company: new ModelDelegate<Company>(),
    account: new ModelDelegate<Account>(),
    accountCompany: new ModelDelegate<AccountCompany>(),
    authorization: new ModelDelegate<Authorization>(),
    preferRegion: new ModelDelegate<PreferRegion>(),
    companyConfig: new ModelDelegate<CompanyConfig>(),
    commonSupplier: new ModelDelegate<CommonSupplier>(),
    supplierAlternateName: new ModelDelegate<SupplierAlternateName>()
};

