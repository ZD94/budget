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

    const sql2 = `select distinct a.mobile,a.pwd, s.company_id from auth.accounts a 
        join staff.staffs s on s.account_id = a.id
        where a.deleted_at is null and a.mobile is not null`;
    const usrs = await db2.query(sql2);

    for (let u of usrs) {
        let sql = `insert into auth.accounts(id,mobile,pwd,created_at,updated_at,company_id) 
            values(${uuid.v1()},${u.mobile},${u.pwd},now(),now(),${u.company_id})`
        await db.query(sql)
    }
}
