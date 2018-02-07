import { Sequelize, Transaction } from 'sequelize';
import {create} from "../../../common/client/ngapp/index";
var uuid = require("uuid").v1;
var SEQUELIZE = require("sequelize")

export default async function update(DB: Sequelize, t: Transaction){
    //await DB.query(sql, {transaction: t});

    let allCompaniesSql = 'select * from company.companies where deleted_at is null;';
    let allCompanies = await DB.query(allCompaniesSql, {type: SEQUELIZE.QueryTypes.SELECT});
    let defaultRegions = ['国内', '国际', '港澳台'];
    let regionIds = [['1814991'], ['1'], ['800000921', '800000922', '800000901']]; //[['CTW_5'], ['Global'], ['CT_2912', 'CT_2911', 'CT_9000']];

    for(let i =0; i< allCompanies.length; i++){
        let allRegionsSql = `select * from travel_policy.company_regions where deleted_at is null and company_id = '${allCompanies[i].id}';`;
        let allRegions = await DB.query(allRegionsSql, {type: SEQUELIZE.QueryTypes.SELECT});
        let allRegionNames = [];
        for(let ii = 0; ii < allRegions.length; ii++) {
            allRegionNames.push(allRegions[ii].name);
        }

        for(let ii =0; ii < defaultRegions.length; ii++){
            if(allRegionNames.indexOf(defaultRegions[ii]) < 0) {
                let companyRegionId = uuid();
                let createCRSql = `insert into travel_policy.company_regions(id, name, company_id, created_at, updated_at, "group", types)
                                       values('${companyRegionId}', '${defaultRegions[ii]}', '${allCompanies[i].id}', now(),now(), 1, '[1,2,3]');`;
                await DB.query(createCRSql, {transaction: t});

                for(let k = 0; k < regionIds[ii].length; k++) {
                    let createRegionSql = `insert into travel_policy.region_places(id, place_id, company_region_id, created_at, updated_at)
                                           values('${uuid()}', '${regionIds[ii][k]}', '${companyRegionId}',now(),now());`;
                    await DB.query(createRegionSql, {transaction: t});
                }
            }
        }

        let allTpsSql = `select * from travel_policy.travel_policies where company_id = '${allCompanies[i].id}' and deleted_at is null;`;
        let allTps = await DB.query(allTpsSql, {type: SEQUELIZE.QueryTypes.SELECT});
        for(let jj=0; jj < allTps.length; jj++) {
            let gangAoTai = [];
            for(let j = 0; j < defaultRegions.length; j++){
                let companyRegionSql = `select * from travel_policy.company_regions
                                    where company_id = '${allCompanies[i].id}' and name = '${defaultRegions[j]}' and deleted_at is null;`;
                let companyRegions = await DB.query(companyRegionSql, {type: SEQUELIZE.QueryTypes.SELECT});
                if(companyRegions && companyRegions.length) {
                    let isExisted = await DB.query(`select * from travel_policy.travel_policy_regions
                                                    where travel_policy_id = '${allTps[jj].id}' and company_region_id = '${companyRegions[0].id}' and deleted_at is null;`,
                        {type: SEQUELIZE.QueryTypes.SELECT});

                    if(isExisted && isExisted.length && defaultRegions[j] == '国际') {
                        gangAoTai.push( `${isExisted[0].plane_levels}`, `${isExisted[0].train_levels}`, `${isExisted[0].hotel_levels}`);
                    }

                    if(!isExisted || isExisted.length == 0) {
                        if(gangAoTai && gangAoTai.length && defaultRegions[j] == '港澳台') {
                            if(gangAoTai[0] == null || gangAoTai[0] == 'null') {
                                gangAoTai[0] = '2';
                            }
                            if(gangAoTai[1] == null || gangAoTai[1] == 'null') {
                                gangAoTai[1] = '3';
                            }
                            if(gangAoTai[2] == null || gangAoTai[2] == 'null') {
                                gangAoTai[2] = '3';
                            }
                            let createTprSql = `insert into travel_policy.travel_policy_regions(id, travel_policy_id, company_region_id,
                                         plane_levels, train_levels, hotel_levels, traffic_prefer, hotel_prefer, created_at, updated_at)
                                    values('${uuid()}', '${allTps[jj].id}', '${companyRegions[0].id}', '{${gangAoTai[0]}}', '{${gangAoTai[1]}}', '{${gangAoTai[2]}}', 50,50, now(), now())`;
                            await DB.query(createTprSql);
                        } else {
                            let createTprSql = `insert into travel_policy.travel_policy_regions(id, travel_policy_id, company_region_id,
                                         plane_levels, train_levels, hotel_levels, traffic_prefer, hotel_prefer, created_at, updated_at)
                                    values('${uuid()}', '${allTps[jj].id}', '${companyRegions[0].id}', '{2}', '{3}', '{3}', 50,50, now(), now())`;
                            await DB.query(createTprSql);
                        }
                    }
                }
            }
        }

    }
}
