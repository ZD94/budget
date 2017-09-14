/**
 * Created by mr_squirrel on 14/09/2017.
 */

'use strict';
import Sequelize = require('sequelize');
import config = require('@jingli/config');

export = async function(db, transition) {
    let db2 = new Sequelize(config.oldPostgres.url);

    const sql2 = `select * from company.suppliers where deleted_at is null`;

    let suppliers = await db2.query(sql2);

    for (let supplier of suppliers.rows) {
        let sql = `insert into company.suppliers (id, created_at, updated_at, type, name, traffic_book_link, hotel_book_link, logo, is_in_use,
        supplier_key) values ('${supplier.id}', now(), now(), '${supplier.type}', '${supplier.name}', '${supplier.traffic_book_link}',
        '${supplier.hotel_book_link}', '${supplier.logo}', ${supplier.is_in_use}', '${supplier.supplier_key}')`;
        await db.query(sql);
    }


}
