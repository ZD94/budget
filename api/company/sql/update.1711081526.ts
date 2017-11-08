/**
 * Created by lsw on 8/11/2017.
 */

'use strict';
import Sequelize = require('sequelize');
const uuid = require('uuid');
const appId = '756b12b3-e243-41ae-982f-dbdfb7ea7e92';
const appSecret = '6c8f2cfd-7aa4-48c7-9d5e-913896acec12';

export = async function (db, transition) {
    let sql = `select count(1) count from company.companies where app_id = '${appId}'`;

    const result = await db.query(sql);
    if (result[0][0]['count'] > 0) {
        return;
    }

    sql = `insert into company.companies (id, name, is_Upload_Invoice, is_Open_Subsidy_Budget, 
        type, app_Id, app_Secret, created_at, updated_at) values ('${uuid.v1()}',
        '鲸力智享', true, true, 3, '${appId}', '${appSecret}', now(), now())`;
    await db.query(sql);
}