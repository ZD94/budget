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
        let mobile = u.mobile
        if (!u || !u.mobile || !u.pwd || !u.company_id) { 
            return;
        }
        let isExist = await accountExsit(mobile, u.company_id);
        if (!isExist) { 
            await insertAccount(uuid.v1(), u.mobile, u.pwd, u.company_id);
        }
    }

    async function accountExsit(mobile, companyId) { 
        let sql = `SELECT count(1) as total FROM auth.accounts WHERE mobile='${mobile}' AND company_id = '${companyId}';`;
        let result = await db.query(sql);
        return !!result[0][0]['total'];
    }

    async function insertAccount(id, mobile, pwd, companyId) { 
        //查询是否已经存在
        let sql = `SELECT count(1) as total FROM auth.accounts WHERE mobile = '${mobile}'`;
        let result = await db.query(sql);
        let rows = result[0]
        if (rows && rows[0] && rows[0]['total'] > 0) {
            mobile = mobile + '0';
            console.warn(`Repeat mobile : ${mobile}`);
            return insertAccount(id, mobile, pwd, companyId);
        }

        sql = `insert into auth.accounts(id,mobile,pwd,created_at,updated_at,company_id) 
            values('${id}','${mobile}','${pwd}',now(),now(),'${companyId}')`
        return db.query(sql)
    }
}