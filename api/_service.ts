/**
 * Created by wlh on 2017/3/14.
 */


'use strict';

import {Budget, BudgetItem, Deeplink} from "_types/budget";
import {App, Statistic} from "_types/openapi";
import {Supplier} from "_types/supplier"
import {createServerService} from "../common/model/sequelize";
import {ModelsInterface, Models} from "../_types/index";
import {TravelPolicy, TravelPolicyRegion, SubsidyTemplate, CompanyRegion, RegionPlace, SubsidyType,
    PolicyRegionSubsidy} from "_types/policy";
import {CurrencyRate, Currency} from "_types/currency";
import {Company} from "_types/company";
import {Account, AccountCompany} from "_types/account";
import {PreferRegion} from "_types/preferRegion";
import {CompanyConfig} from "_types/company";
import {Authorization} from "../_types/account/authorization";
import {CommonSupplier, SupplierAlternateName} from "_types/commonSupplier";
import { AirCompany } from '_types/static/aircompany';
import { TmcTypes, TmcSupplier } from "_types/tmcSupplier";


export function initModels(models: ModelsInterface) {
    for (let k in models) {
        if (Models[k])
            Models[k].setTarget(models[k]);
    }
}

initModels({
    budget: createServerService<Budget>(Budget),
    budgetItem: createServerService<BudgetItem>(BudgetItem),
    deeplink: createServerService<Deeplink>(Deeplink),
    travelPolicy: createServerService<TravelPolicy>(TravelPolicy),
    travelPolicyRegion: createServerService<TravelPolicyRegion>(TravelPolicyRegion),
    companyRegion: createServerService<CompanyRegion>(CompanyRegion),
    regionPlace: createServerService<RegionPlace>(RegionPlace),
    subsidyTemplate: createServerService<SubsidyTemplate>(SubsidyTemplate),
    app: createServerService<App>(App),
    statistic: createServerService<Statistic>(Statistic),
    subsidyType: createServerService<SubsidyType>(SubsidyType),
    policyRegionSubsidy: createServerService<PolicyRegionSubsidy>(PolicyRegionSubsidy),
    currencyRate: createServerService<CurrencyRate>(CurrencyRate),
    currency: createServerService<Currency>(Currency),
    supplier: createServerService<Supplier>(Supplier),
    company: createServerService<Company>(Company),
    account: createServerService<Account>(Account),
    authorization: createServerService<Authorization>(Authorization),
    accountCompany: createServerService<AccountCompany>(AccountCompany),
    preferRegion: createServerService<PreferRegion>(PreferRegion),
    companyConfig: createServerService<CompanyConfig>(CompanyConfig),
    commonSupplier: createServerService<CommonSupplier>(CommonSupplier),
    supplierAlternateName: createServerService<SupplierAlternateName>(SupplierAlternateName),
    aircompany: createServerService<AirCompany>(AirCompany),
    tmcTypes: createServerService<TmcTypes>(TmcTypes),
    tmcSupplier: createServerService<TmcSupplier>(TmcSupplier)
});
