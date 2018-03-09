/**
 * Created by YCXJ on 2014/5/6.
 */
'use strict';

//可以直接require服务器根目录下的模块
require('app-module-path').addPath(__dirname);
require('common/node_ts').install();

Error.stackTraceLimit = 40;
var zone = require('@jingli/zone-setup');

global.Promise = require('bluebird');
Promise.promisifyAll(require("redis"));
Promise.promisifyAll(require("fs"));

var config = require("@jingli/config");

Promise.config({ warnings: false });
if (config.debug) {
    Promise.config({ longStackTraces: false });
}

var city = require('@jingli/city');
city.init({placeUrl: config.placeAPI + '/city'});

var path = require('path');

var Logger = require('@jingli/logger');
Logger.init(config.logger);
var logger = new Logger('main');

var cache = require("common/cache");
cache.init({ redis_conf: config.redis.url, prefix: 'jlbudget:cache:' + config.appName });

var db = require('@jingli/database');
db.init(config.postgres.url);
db.DB.sync({ force: false });

var API = require('@jingli/dnode-api');

var Server = require('common/server');
var server = new Server(config.appName, config.pid_file);

server.cluster = config.cluster;

server.http_logtype = config.logger.httptype;
server.http_port = config.port;
if (config.socket_file) {
    server.http_port = config.socket_file;
}
server.http_root = path.join(__dirname, 'www');
// server.http_favicon = path.join(server.http_root, 'favicon.ico');
//server.on('init.http_handler', require('./app'));

server.api_path = path.join(__dirname, 'api');
server.api_port = config.apiPort;
server.api_config = config.api;

require("./model");

server.on('init.api', function (API) {
    console.log("init.api")
    //     API.registerAuthWeb(API.auth.authentication);
});

server.on('init.http', function (httpserver) {
    console.log("init.http")
});


var httpModule = require('./http');
server.on('init.http_handler', function (app) {
    httpModule.initHttp(app);
})


zone.forkStackTrace().run(function () {
    require("common/model/index")
    server.start();
});

process.on('unhandledRejection', (reason, p) => {
    if (config.debug) {
        throw reason;
    }
    logger.error(reason);
});