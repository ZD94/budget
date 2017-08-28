/**
 * Created by wlh on 2017/8/28.
 */

'use strict';

import fs = require("fs")
import path = require("path");

export function scannerControllers(dir: string, ignores: string[]) {
    let files = fs.readdirSync(dir);
    for(let f of files) {
        let extReg = /\.ts|\.js$/;
        if (ignores && ignores.indexOf(f.replace(extReg, '')) >= 0) {
            continue;
        }
        let p = path.join(dir, f);
        let stat = fs.statSync(p);
        if (stat.isDirectory()) {
            scannerControllers(p);
            continue;
        }
        if (!extReg.test(p)) {
            continue;
        }
        p = p.replace(extReg, '');
        require(p);
    }
}

scannerControllers(__dirname);