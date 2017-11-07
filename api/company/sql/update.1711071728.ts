/**
 * Created by mr_squirrel on 14/09/2017.
 */

'use strict';
import Sequelize = require('sequelize');
import config = require('@jingli/config');
import md5 = require('md5');

export = async function(db, transition) {
    // let db2 = new Sequelize(config.oldPostgres.url);
    let db2 = new Sequelize(config.oldPostgres.url);

    const sql2 = `select * from company.companies where deleted_at is null`;

    let companies = await db2.query(sql2);

    for (let c of companies[0]) {
        const appId = md5(c.id);
        let sql = `insert into company.companies(id,name,created_at,updated_at,type,app_id,app_secret) 
            values(${c.id},${c.name},${c.created_at},${c.updated_at},1,${appId},${appId.slice(-8)})`;

        await db.query(sql);
    }
}
