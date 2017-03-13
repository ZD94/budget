/**
 * Created by wlh on 2017/3/10.
 */
'use strict';
const _ = require("lodash");
const path = require("path");
let p = path.normalize(path.join("../", __dirname));
require('app-module-path').addPath(p);
require('../common/node_ts')
    .install(false);

let glob = require("glob");
let files1 = glob.sync("test/*.test.@(ts|js)");
let files = glob.sync("test/**/*.test.@(ts|js)")

files = _.concat(files, files1);
files.forEach( (f) => {
    f = path.resolve(f)
    f = f.replace(/\.[tj]s$/, "")
    require(f);
})

describe("test.js", function() {

    it("test.js should be ok", function(done) {
        done();
    })
})