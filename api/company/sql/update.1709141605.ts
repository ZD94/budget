/**
 * Created by mr_squirrel on 14/09/2017.
 */

'use strict';
import Sequelize = require('sequelize');
import config = require('@jingli/config');

export = async function(db, transition) {
    // let db2 = new Sequelize(config.oldPostgres.url);
    let db2 = new Sequelize('postgres://times:time0418@l.jingli365.com:15432/times');

    const sql2 = `select * from company.suppliers where deleted_at is null`;
    const sql3 = `select * from company.companies where deleted_at is null`;

    let suppliers = await db2.query(sql2);
    let companies = await db2.query(sql3);


    for (let supplier of suppliers[0]) {
        let sql;

        if (supplier.company_id == null) {
            sql = `insert into company.suppliers (id, created_at, updated_at, type, name, traffic_book_link, hotel_book_link, 
        logo, is_in_use, company_id, supplier_key) values ('${supplier.id}', now(), now(), '${supplier.type}', '${supplier.name}', 
        '${supplier.traffic_book_link}','${supplier.hotel_book_link}', '${supplier.logo}', '${supplier.is_in_use}', ${supplier.company_id}, '${supplier.supplier_key}')`;
        }
        else {
            sql = `insert into company.suppliers (id, created_at, updated_at, type, name, traffic_book_link, hotel_book_link, 
        logo, is_in_use, company_id, supplier_key) values ('${supplier.id}', now(), now(), '${supplier.type}', '${supplier.name}', 
        '${supplier.traffic_book_link}','${supplier.hotel_book_link}', '${supplier.logo}', '${supplier.is_in_use}', '${supplier.company_id}', '${supplier.supplier_key}')`;
        }
        await db.query(sql);
    }

    for (let company of companies[0]) {
        let sql_com;
        let sql_exist;
        let appointed = company.appointed_pubilc_suppliers;
        if (typeof company.appointed_pubilc_suppliers == 'object') {
            appointed = JSON.stringify(company.appointed_pubilc_suppliers);
        }
        // console.log('appointed', appointed);
        sql_exist= `select * from company.companies where id = '${company.id}'`;
        let isExist = await db.query(sql_exist);
        console.log(isExist[0].length);
        if (isExist[0].length > 0) {
            sql_com = `update company.companies set updated_at = now() where id = '${company.id}'`;
        }else {
            sql_com = `insert into company.companies (id, name, created_at, updated_at, appointed_pubilc_suppliers) values 
         ('${company.id}', '${company.name}', now(), now(), '${appointed}')`;
        }

        // console.log('sql0', sql0);
        // console.log(sql_com);
        await db.query(sql_com);
    }
}
