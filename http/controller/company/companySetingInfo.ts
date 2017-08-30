/**
 * Created by wyl on 2017/8/29.
 */

'use strict';
import {AbstractController} from "http/core/AbstractController";
import {AbstractModelController} from "http/core/AbstractModelController";
import {Restful} from "http/core/decorator";
import API from '@jingli/dnode-api';
import {CompanySetingInfo} from "_types/companySetingInfo";
import {Models} from "_types";
var companySetingInfoCols = CompanySetingInfo['$fieldnames'];

@Restful()
export class CompanySetingInfoController extends AbstractModelController {

    constructor() {
        super(Models.companySetingInfo, companySetingInfoCols);
    }


}

