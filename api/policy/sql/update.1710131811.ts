
import { Sequelize, Transaction } from 'sequelize';
import {create} from "../../../common/client/ngapp/index";
var uuid = require("uuid").v1;

export default async function update(DB: Sequelize, t: Transaction){
    //await DB.query(sql, {transaction: t});

    let allCompaniesSql = 'select distinct companies from travel_policy.company_regions where deleted_at is null;';
    let allCompanies = await DB.query(allCompaniesSql, {type: Sequelize.QueryTypes.SELECT});
    let defaultRegions = ['国内', '国际', '港澳台'];
    let regionIds = [['CTW_5'], ['Global'], ['CT_2912', 'CT_2911', 'CT_9000']];

    for(let i =0; i< allCompanies.length; i++){
        let allRegionsSql = `select name from travel_policy.company_regions where deleted_at is null and company_id = ${allCompanies[i].id};`;
        let allRegions = await DB.query(allRegionsSql, {type: Sequelize.QueryTypes.SELECT});

        for(let ii =0; ii < defaultRegions.length; ii++){
            if(allRegions.indexOf(defaultRegions[ii]) < 0) {
                let createCRSql = `insert into travel_policy.company_regions(id,name,company_id,created_at,updated_at,group, types) 
                                       values('${uuid()}', '${defaultRegions[ii]}', '${allCompanies[i].id}'，now(),now(), 1, '{1,2,3}');`;
                let companyRegion = await DB.query(createCRSql, {transaction: t});
                if(!companyRegion) continue;
                for(let k = 0; k < regionIds[ii].length; k++) {
                    let createRegionSql = `insert into travel_policy.region_places(id, place_id, company_region_id, created_at, updated_at) values('${uuid()}', '${regionIds[ii][k]}', '${companyRegion.id}', now(),now());`;
                    await DB.query(createRegionSql, {transaction: t});
                }
            }

            //添加travel_policy_region
            let
        }
    }
}
