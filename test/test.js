/**
 * Created by wlh on 15/12/9.
 */
"use strict";
var path = require('path');
var fs = require("fs");
process.env.NODE_PATH = '.:'+process.env.NODE_PATH;

require('app-module-path').addPath(path.normalize(path.join(__dirname, '..')));
var zone = require('@jingli/zone-setup');
require('common/node_ts').install();

global.Promise = require('bluebird');
Promise.config({ longStackTraces: false });
Promise.promisifyAll(require('fs'));

process.on('unhandledRejection', (reason, p) => {
    throw reason;
});

// require('./mocha-zone')(global);

var config = require("@jingli/config");

var Logger = require('@jingli/logger');
Logger.init({
    path: path.join(__dirname, "../log"),
    prefix: "mocha_",
    console: false,
    mods: {
        sequelize: { console: false }
    }
});
var logger = new Logger('test');

var API = require('@jingli/dnode-api');

var db = require('@jingli/database');
db.init(config.postgres.url_test);

zone.forkStackTrace()
    .fork({name: 'test', properties: {session: {}}})
    .run(function(){
        return Promise.resolve()
            .then( () => {
                return db.DB.sync({force: false})
            })
            .then(function(){
                return API.initSql(path.join(__dirname, '../api'), config.api_test)
            })
            .then(function(ret){
                return API.init(path.join(__dirname, '../api'), config.api)
            })
            .then(function() {
                loadTest(path.join(__dirname, '../http'));
                // require('../http/test/company.test')
            })
            .then(API.loadTests.bind(API))
            .then(run)
            .catch(function(e){
                logger.error(e.stack?e.stack:e);
                console.error(e.stack?e.stack:e);
                process.exit();
            })
    });

const CURRENT_PATH = __dirname;

function loadTest(dir) {
    var files = fs.readdirSync(dir)
    for(var f of files) {
        let fullPath = path.join(dir, f)
        var stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
            loadTest(fullPath);
        }
        if (!/\.test\.(js|ts)$/.test(fullPath)) {
            continue;
        }
        var p = path.relative(CURRENT_PATH, fullPath);
        p = p.replace(/\.(ts|js)$/, "");
        console.log(p)
        require(p);
    }
}