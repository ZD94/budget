/**
 * Created by wyl on 2017/8/29.
 */

'use strict';
import {AbstractController, AbstractModelController, Restful} from "@jingli/restful";
import API from '@jingli/dnode-api';
import {Company} from "_types/company";
import {Models} from "_types";
var companyCols = Company['$fieldnames'];

@Restful()
export class CompanyController extends AbstractModelController {

    constructor() {
        super(Models.company, companyCols);
    }


}

