/**
 * Created by wlh on 2017/3/10.
 */
'use strict';
const _ = require("lodash");
const path = require("path");
require('app-module-path').addPath(path.normalize(path.join(__dirname, '..')));
require('common/node_ts')
    .install();


require("../_type");

//初始化数据库
let config = require("../config");
let model = require("../common/model")
model.init(config.pg.url);
model.initDefines();

var Logger = require('common/logger');
Logger.init({
    path: path.join(__dirname, "../log"),
    prefix: "mocha_",
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

let glob = require("glob");
let files1 = glob.sync("test/*.test.@(ts|js)");
let files = glob.sync("test/**/*.test.@(ts|js)")

files = _.concat(files, files1);
files.forEach( (f) => {
    f = path.resolve(f)
    f = f.replace(/\.[tj]s$/, "")
    require(f);
})