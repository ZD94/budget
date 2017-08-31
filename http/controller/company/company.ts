/**
 * Created by wyl on 2017/8/29.
 */

'use strict';
import {AbstractController} from "http/core/AbstractController";
import {AbstractModelController} from "http/core/AbstractModelController";
import {Restful} from "http/core/decorator";
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

