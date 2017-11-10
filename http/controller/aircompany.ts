import { AbstractModelController, Restful } from '@jingli/restful';
import { Models } from '_types';
import { AirCompany } from '_types/static/aircompany';

let aircompanyCols = AirCompany['$fieldnames'];

@Restful()
export default class AirCompanyController extends AbstractModelController<AirCompany> { 
    constructor() { 
        super(Models.aircompany, aircompanyCols);
    }

    $isValidId(id: string) {
        return /^\w{2}$/.test(id);
    }

    async delete(req, res, next) { 
        res.send(404);
    }

    async add(req, res, next) { 
        res.send(404);
    }

    async update(req, res, next) { 
        res.send(404);
    }
}