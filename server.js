/**
 * Created by wlh on 2017/3/10.
 */
'use strict';

require("app-module-path/register")
require("common/node_ts").install(false);

let config = require("./config");
require("./common/model").init(config.pg.url);