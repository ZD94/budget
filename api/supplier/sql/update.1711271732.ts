import * as uid from "uuid";

var commonSuppliers = [
        { name: "meiya", logo: '65a3a3e0-d41e-11e7-b0de-dd6f9fe2131c', enName: '美亚', alias: '美亚' }
];


module.exports = async function (DB, t) {
        commonSuppliers.forEach(async (supplier) => {
                let name = supplier.name;
                let logo = supplier.logo;
                let alias = supplier.alias;
                let enName = supplier.enName;
                let id = uid.v1();

                let sql = `INSERT INTO "supplier"."common_suppliers" ("id", "name","alias", "logo", "created_at", "updated_at") 
        VALUES ('${id}', '${name}', '${alias}', '${logo}', now(), now());`;
                await DB.query(sql);

                if (enName) {
                        let sq2 = `INSERT INTO supplier.supplier_alternate_names(
            id, common_supplier_id, type, value, created_at, updated_at)
            VALUES ('${uid.v1()}', '${id}', 'budgetInfo', '${enName}', now(), now());`;
                        await DB.query(sq2);
                }
        })
}