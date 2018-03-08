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

// var Logger = require('@jingli/logger');
// Logger.init({
//     path: path.join(__dirname, "../log"),
//     prefix: "mocha_",
//     console: false,
//     mods: {
//         sequelize: { console: false }
//     }
// });
// var logger = new Logger('test');

var API = require('@jingli/dnode-api');

var db = require('@jingli/database');
db.init(config.postgres.url_test);
//
// var Server = require('common/server');
// var server = new Server(config.appName, config.pid_file);
//
// server.cluster = config.cluster;
//
// server.http_logtype = config.logger.httptype;
// server.http_port = config.port;
// if (config.socket_file) {
//     server.http_port = config.socket_file;
// }
// server.http_root = path.join(__dirname, 'www');
// // server.http_favicon = path.join(server.http_root, 'favicon.ico');
// //server.on('init.http_handler', require('./app'));
//
// server.api_path = path.join(__dirname, '../api');
// server.api_port = config.apiPort;
// server.api_config = config.api;
// var httpModule = require('../http');
// server.on('init.http_handler', function (app) {
//     httpModule.initHttp(app);
// })

// zone.forkStackTrace()
//     .fork({name: 'test', properties: {session: {}}})
//     .run(function(){
//         return Promise.resolve()
//             .then( () => {
//                 return db.DB.sync({force: false})
//             })
//             .then(function(){
//                 return API.initSql(path.join(__dirname, '../api'), config.api_test)
//             })
//             .then(function(ret){
//                 return API.init(path.join(__dirname, '../api'), config.api)
//             })
//             .then(function() {
//                 loadTest(path.join(__dirname, '../http'));
//             })
//             .then(API.loadTests.bind(API))
//             // .then(function() {
//             //     server.start();
//             // })
//             .then(run)
//             .catch(function(e){
//                 logger.error(e.stack?e.stack:e);
//                 console.error(e.stack?e.stack:e);
//                 process.exit();
//             })
//     });

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
        require(p);
    }
}