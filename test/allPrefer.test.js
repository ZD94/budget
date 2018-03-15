/*
 * @Author: Mr.He 
 * @Date: 2018-03-09 15:08:11 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-03-09 15:08:34
 * @content what is the content of this file. */

let path = require("path");
let fs = require("fs");
require("ts-node").register({ fast: true });


function loadTest(dir) {
    var files = fs.readdirSync(dir)
    for (var f of files) {
        let fullPath = path.join(dir, f)
        var stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
            loadTest(fullPath);
        }

        if (!/\.test\.(js|ts)$/.test(fullPath)) {
            continue;
        }

        let p = fullPath.replace(/\.(ts|js)$/, "");
        require(p);
    }
}
loadTest(path.join(__dirname, "./model/budget/prefer"));