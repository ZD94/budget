let id = require("uuid");

module.exports =async function(DB, t) {
    // CTW_128
    let sql = `select * from travel_policy.company_regions where name = '港澳台'`;
    let companyRegion = await DB.query(sql);
    if(companyRegion){
        companyRegion = companyRegion[0];
    }

    companyRegion.forEach(async (item) => {
        let sql1 = `INSERT INTO travel_policy.region_places(
            id, place_id, company_region_id, created_at, updated_at)
            VALUES ('${id.v1()}', 'CTW_128', '${item.id}', now(), now());`;
        console.info( "sql1==", sql1);
        await DB.query(sql1);
    })
}