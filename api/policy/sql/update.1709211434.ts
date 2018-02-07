const uuid = require("uuid");
import {Sequelize, Transaction} from "sequelize";
var DefaultRegion = {
    domestic: '国内',
    abroad:  '国际'
};

var DefaultRegionId = {
    domestic: '1814991',  //表示中国
    abroad:  '1'          //表示最顶级-全球
};
var subsidyRegions = [
    {name:DefaultRegion.abroad, cityIds: [DefaultRegionId.abroad], group: 2, types: '[1,2,3]'},
    {name:DefaultRegion.domestic, cityIds: [DefaultRegionId.domestic], group: 1, types: '[1,2,3]'},
    {name:'中国一类地区', cityIds: ['1795563','1809857','1796231','2038349'], group: 1, types: '[2,3]'},
    {name:'中国二类地区', cityIds: ['800000235','1808925','1815551','1790902','1790384','2034935','1797926','1799960','1791243','1814068','1810821','1815285','1792943','1805751','1814905'], group: 1, types: '[2,3]'},
    {name:'港澳台', cityIds: ['800000921','800000922','800000901'], group: 2, types: '[1,2,3]'}
];

/**
 * @method 未成功初始化默认地区的公司进行首次更新
 */
export default async function update(DB: Sequelize, t: Transaction) {
    let sql = `select * from company.companies where deleted_at is null`;
    let companies = await DB.query(sql);
    if(companies) companies = companies[0];

    for(let i=0;i<companies.length;i++){
        let company = companies[i];
        subsidyRegions.forEach(async (regionGroup) => {
            let cityIds = regionGroup.cityIds;
            let name = regionGroup.name;
            let group = regionGroup.group;
            let types = regionGroup.types;
            let sql1 = `select * from travel_policy.company_regions where company_id = '${company.id}' and name = '${name}'`;
            let companyRegion = await DB.query(sql1);
            if(companyRegion){
                companyRegion = companyRegion[0];
            }
            if(!(companyRegion && companyRegion.length)){
                let id = uuid.v1();
                let sql3 = `INSERT INTO travel_policy.company_regions(
            id, name, company_id, created_at, updated_at, "group", types)
    VALUES ('${id}', '${name}', '${company.id}', now(), now(), ${group}, '${types}');`;
                console.info( "sql3==", sql3);
                await DB.query(sql3);

                await Promise.all(cityIds.map(async (cityId) => {
                    let sql4 = `INSERT INTO travel_policy.region_places(
            id, place_id, company_region_id, created_at, updated_at)
    VALUES ('${uuid.v1()}', '${cityId}', '${id}', now(), now());`;
                    console.info( "sql4==", sql4);
                    await DB.query(sql4);
                }));
            }

        })
    }
}