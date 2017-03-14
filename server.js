/**
 * Created by wlh on 2017/3/10.
 */
'use strict';

var path = require("path");
require("app-module-path/register")
require("common/node_ts").install(false);

require("_type");

//初始化数据库
let config = require("config");
let model = require("common/model")
model.init(config.pg.url);
model.initDefines();

var Logger = require('common/logger');
Logger.init({
    path: path.join(__dirname, "log"),
    prefix: "jlbudget_",
    console: false,
    mods: {
        sequelize: { console: false }
    }
});

model.databaseSync()
    .catch( (err) => {
        console.error(err);
        throw err;
    })

const app = require("./router");




const http = require("http");
let server = http.createServer(app);
server.listen(3000);