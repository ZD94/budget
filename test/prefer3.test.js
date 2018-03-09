/*
 * @Author: Mr.He 
 * @Date: 2018-03-08 17:31:34 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-03-09 11:04:44
 * @content what is the content of this file. */


require("ts-node").register({ fast: true });

// require('./model/budget/prefer/hotel-blacklist.test.ts');
// require('./model/budget/prefer/hotel-star-match.test.ts');
// require('./model/budget/prefer/hotel-represent.test.ts');
// require('./model/budget/prefer/hotel-pricerange.test.ts');
// require('./model/budget/prefer/hotel-distance.test.ts');
require('./model/budget/prefer/price.test.ts');


// let paths = ["hotel-blacklist", "hotel-star-match", "hotel-represent"];
// let path = require("path");
// let fs = require("fs");
// function loadTest(dir) {
//     var files = fs.readdirSync(dir)
//     for (var f of files) {
//         let fullPath = path.join(dir, f)
//         var stat = fs.statSync(fullPath)
//         if (stat.isDirectory()) {
//             loadTest(fullPath);
//         }

//         if (!/\.test\.(js|ts)$/.test(fullPath)) {
//             continue;
//         }


//         for (let item of paths) {
//             if (f.indexOf(item) >= 0) {
//                 let p = fullPath.replace(/\.(ts|js)$/, "");
//                 require(p);
//             }
//         }

//     }
// }
// loadTest(path.join(__dirname, "./model/budget/prefer"));