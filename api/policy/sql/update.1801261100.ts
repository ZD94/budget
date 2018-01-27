
import {Sequelize, Transaction} from "sequelize";
import { PreferRegion } from '_types/preferRegion';
var sequelize = require("sequelize");

/**
 * @method 更新preferRegion表中的cheapsupplier为cheapSuppliers
 * @param DB {sequelize}
 * @param t {transaction}
 */
export default async function update(DB: Sequelize, t: Transaction) {
    
    let sql = `select * from travel_policy.prefer_regions where deleted_at is null;`;

    let preferRegions = await DB.query(sql, {type: sequelize.QueryTypes.SELECT});
    let ps = preferRegions.map(async (preferRegion: PreferRegion) => {
        let budgetConfig = preferRegion.budget_config;
        if(typeof budgetConfig == 'string')
            budgetConfig = JSON.parse(budgetConfig);
        
        let trafficConfig: any
        if(budgetConfig && budgetConfig.hasOwnProperty('traffic')){
            trafficConfig = budgetConfig.traffic;
        }
        if(trafficConfig && trafficConfig.length){
            trafficConfig = await Promise.all(trafficConfig.map(async (traffic: any) => {
                if(traffic.name && traffic.name == 'cheapSupplier'){
                    if(traffic.hasOwnProperty('cheapsupplier')){
                        traffic['cheapSuppliers'] = traffic['cheapsupplier'];
                        delete traffic['cheapsupplier'];
                    }
                }
                return traffic;
            }));
            budgetConfig.traffic = trafficConfig;
            if(typeof budgetConfig != 'string')
                budgetConfig = JSON.stringify(budgetConfig);
            budgetConfig = budgetConfig.replace(/\\'/g, "''"); 
            let updateSql = `update travel_policy.prefer_regions set budget_config = '${budgetConfig}' where id = '${preferRegion.id}'`;
            await DB.query(updateSql);
        }
    })
    await Promise.all(ps);
    return true;
}