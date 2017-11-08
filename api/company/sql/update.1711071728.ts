/**
 * Created by mr_squirrel on 14/09/2017.
 */

'use strict';
import Sequelize = require('sequelize');
import config = require('@jingli/config');
import md5 = require('md5');
const uuid = require('uuid');

export = async function (db, transition) {

    let db2 = new Sequelize(config.oldPostgres.url);

    const sql2 = `select a.mobile, a.pwd, c.id as company_id from auth.accounts a 
        join company.companies c on c.create_user = a.id
        where a.deleted_at is null and a.mobile is not null`;
    const usrs = await db2.query(sql2);

    for (let u of usrs[0]) {
        if (u && u.mobile && u.pwd && u.company_id) { 
            let sql = `insert into auth.accounts(id,mobile,pwd,created_at,updated_at,company_id) 
            values('${uuid.v1()}','${u.mobile}','${u.pwd}',now(),now(),'${u.company_id}')`
            await db.query(sql)
        }
    }
}
