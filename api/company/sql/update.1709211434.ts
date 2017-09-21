let uuid = require("uuid");
var DefaultRegion = {
    domestic: '国内',
    abroad:  '国际'
};

var DefaultRegionId = {
    domestic: 'CTW_5',
    abroad:  'Global'
};
var subsidyRegions = [
    {name:DefaultRegion.abroad, cityIds: [DefaultRegionId.abroad]},
    {name:DefaultRegion.domestic, cityIds: [DefaultRegionId.domestic]},
    {name:"中国一类地区", cityIds: ['CT_340','CT_257','CT_289','CT_131']},
    {name:"中国二类地区", cityIds: ['CT_194','CT_179','CT_158','CT_317','CT_233','CT_058','CT_236','CT_315','CT_218','CT_167','CT_300','CT_075','CT_332','CT_288','CT_132']},
    {name:"港澳台", cityIds: ['CT_2912','CT_9000','CT_2911']}
];


module.exports =async function(DB, t) {
    let sql = `select * from company.companies where deleted_at is null`;
    let companies = await DB.query(sql);
    if(companies) companies = companies[0];

    for(let i=0;i<companies.length;i++){
        let company = companies[i];
        subsidyRegions.forEach(async (regionGroup) => {
            let cityIds = regionGroup.cityIds;
            let name = regionGroup.name;
            let sql1 = `select * from travel_policy.company_regions where company_id = '${company.id}' and name = '${name}'`;
            let companyRegion = await DB.query(sql1);
            if(companyRegion){
                companyRegion = companyRegion[0];
            }
            if(!companyRegion){
                let id = uuid.v1();
                let sql3 = `INSERT INTO travel_policy.company_regions(
            id, name, company_id, created_at, updated_at)
    VALUES ('${id}', '${name}', '${company.id}', now(), now());`;
                await DB.query(sql3);

                await Promise.all(cityIds.map(async (cityId) => {
                    let sql4 = `INSERT INTO travel_policy.region_places(
            id, place_id, company_region_id, created_at, updated_at)
    VALUES ('${uuid.v1()}', '${cityId}', '${id}', now(), now());`;
                    await DB.query(sql4);
                }));
            }

        })
    }
}