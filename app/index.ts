import {modelRestfulHelper} from "./route-helper";
var express = require("express");
import commonResp = require("./resp");
var route = express();
route.use(commonResp);

let tpRegister = modelRestfulHelper('travelPolicy',
    {methods: ["find","get","create","update","delete"], query:["companyId", 'id']});

let tprRegister = modelRestfulHelper('travelPolicyRegion',
    {methods: ["find","get","create","update","delete"], query:['companyId', 'id', 'travelPolicyId','companyRegionId']});

let crRegister = modelRestfulHelper('companyRegion',
    {methods: ["find","get","create","update","delete"], query:['companyId','id']});

let rpRegister = modelRestfulHelper('regionPlace',
    {methods: ["find","get","create","update","delete"], query:['companyId','id','companyRegionId']});

let stRegister = modelRestfulHelper('subsidyTemplate',
    {methods: ["find","get","create","update","delete"], query:['companyId','id', 'travelPolicyId']});

tpRegister(route);
// tprRegister(route);
// crRegister(route);
// rpRegister(route);
// stRegister(route);



//自定义路由
// route.post('/travelPolicy/:companyId/isDefault', async function(res){
//
// });


export = route;






// app.post("/policy", async function(req, res, next){
//     // let {method, params} = req;
//     console.log("=====> param: ", req.body);
//     let body = req.body;
//     let {fields, method} = req.body;
//     let result =await TravelPolicyModule[method](fields);
//
//     console.log(result);
//     res.json(result);
//     // res.json("hello world: ");
// });
// app.get("/policy/info", async function(req, res, next){
//     // let {method, params} = req;
//     console.log("=====> param: ", req);
//     // let result = TravelPolicyModule[method](params);
//     // res.json(result);
//     res.json("hello world: ");
// });


// req.query  用于获取使用？传递参数的参数
// req.params 用于获取使用/: 获取参数的参数
// req.data  存储post请求

//
// route.get('/model/:id*?/:companyId*?', async function(req, res){
//     console.log("data", req.data);
//     // console.log("route", req.route);
//     console.log("query", req.query);
//     console.log("params", req.params);
//     // console.log("param", req.param);
//     console.log("url", req.url);
//     // console.log("req", req);
//     res.json("hello world");
// });
