
import { Sequelize, Transaction } from 'sequelize';
import {create} from "../../../common/client/ngapp/index";
var uuid = require("uuid").v1;
var SEQUELIZE = require("sequelize")

export default async function update(DB: Sequelize, t: Transaction){
    //await DB.query(sql, {transaction: t});

    let allCompaniesSql = 'select * from company.companies where deleted_at is null;';
    let allCompanies = await DB.query(allCompaniesSql, {type: SEQUELIZE.QueryTypes.SELECT});
    let defaultRegions = ['国内', '国际', '港澳台'];
    let regionIds = [['CTW_5'], ['Global'], ['CT_2912', 'CT_2911', 'CT_9000']];

    for(let i =0; i< allCompanies.length; i++){
        let allRegionsSql = `select name from travel_policy.company_regions where deleted_at is null and company_id = ${allCompanies[i].id};`;
        let allRegions = await DB.query(allRegionsSql, {type: SEQUELIZE.QueryTypes.SELECT});

        for(let ii =0; ii < defaultRegions.length; ii++){
            if(allRegions.indexOf(defaultRegions[ii]) < 0) {
                let createCRSql = `insert into travel_policy.company_regions(id,name,company_id,created_at,updated_at,group, types) 
                                       values('${uuid()}', '${defaultRegions[ii]}', '${allCompanies[i].id}'，now(),now(), 1, '{1,2,3}');`;
                let companyRegion = await DB.query(createCRSql, {transaction: t});
                if(!companyRegion) continue;
                for(let k = 0; k < regionIds[ii].length; k++) {
                    let createRegionSql = `insert into travel_policy.region_places(id, place_id, company_region_id, created_at, updated_at) 
                                           values('${uuid()}', '${regionIds[ii][k]}', '${companyRegion.id}', now(),now());`;
                    await DB.query(createRegionSql, {transaction: t});
                }
            }
        }



        let allTpsSql = `select * from travel_policy.travel_policy where company_id = '${allCompanies[i].id}' and deleted_at is null;`;
        let allTps = await DB.query(allTpsSql, {type: SEQUELIZE.QueryTypes.SELECT});
        for(let jj=0; jj < allTps.length; jj++) {
            for(let j = 0; j < defaultRegions.length; j++){
                let companyRegionSql = `select * from travel_policy.company_regions 
                                    where company_id = '${allCompanies[i].id}' and name = '${defaultRegions[j]}' and deleted_at is null;`;
                let companyRegions = await DB.query(companyRegionSql, {type: SEQUELIZE.QueryTypes.SELECT});
                if(companyRegions && companyRegions.length) {
                    let isExisted = await DB.query(`select * from travel_policy.travel_policy_regions 
                                                    where travel_policy_id = '${allTps[jj]}' and company_regions_id = '${companyRegions[0].id}' and deleted_at is null;`,
                        {type: SEQUELIZE.QueryTypes.SELECT});
                    if(!isExisted || isExisted.length == 0) {
                        let createTprSql = `insert into travel_policy.travel_policy_regions(id, travel_policy_id, company_region_id, 
                                         plane_levels, train_levels, hotel_levels, traffic_prefer, hotel_prefer, created_at, updated_at) 
                                    values('${uuid()}', '${allTps[jj].id}', '${companyRegions[0].id}', '', '', '', 50,50, now(), now())`;
                        await DB.query(createTprSql);
                    }
                }
            }
        }

    }
}
