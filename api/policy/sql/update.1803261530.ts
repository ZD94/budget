import {Sequelize, Transaction} from "sequelize";
const sequelize = require("sequelize");
let offset = 0;
const removedCheapSupplier = 'HO';  //将HO(吉祥航空)移除廉价供应商组
const ProcessUnit = 10;
const _ = require('lodash')
export default async function update(DB: Sequelize, t: Transaction){

    do {
        await processOldDataByBatch(DB)
    } while(offset >= 0)

    return ;
}

/**
 * @method 移除 'HO' 于cheapSupplier
 * @param DB 
 * @return 
 */
async function processOldDataByBatch(DB: Sequelize){
    let sql = `select * from travel_policy.prefer_regions where deleted_at is null order by created_at desc limit ${ProcessUnit} offset ${offset}`;

    let result = await DB.query(sql, {type: sequelize.QueryTypes.SELECT});
    if(!result) {
        offset = -1;
        return; 
    }

    if(result.length < ProcessUnit) offset = -1;
    if(result.length == ProcessUnit) offset += ProcessUnit;

    let ps = result.map(async (item: any) => {
        let budget_config = item['budget_config'];
        if(typeof budget_config == 'string') budget_config = JSON.parse(budget_config);

        if(!budget_config.traffic || !budget_config.traffic.length) return item;

        for(let idx in budget_config.traffic) {
            if(!budget_config.traffic[idx] || budget_config.traffic[idx].name != 'cheapSupplier') continue;
  
            if(budget_config.traffic[idx].options && budget_config.traffic[idx].options.cheapSuppliers && _.isArray(budget_config.traffic[idx].options.cheapSuppliers)){
                let index = budget_config.traffic[idx].options.cheapSuppliers.indexOf(removedCheapSupplier);
                if(~index) {
                    budget_config.traffic[idx].options.cheapSuppliers.splice(index, 1);
                }   
            } else {
                budget_config.traffic.splice(idx,1);
            }   
        }
        if(typeof budget_config != 'string') budget_config = JSON.stringify(budget_config)
        let update = `update travel_policy.prefer_regions set budget_config =E'${budget_config}' where id = '${item.id}'`;
        await DB.query(update);
        return item;
    
    })
    await Promise.all(ps);
    return ;
}