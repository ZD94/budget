
import {modelRestfulHelper} from "./route-helper";
var express = require("express");
//
var route = express();

route.get('/:model', async function(req, res){
    console.log("get", req.params);
    res.json("hello world");
});
//
// route.post('/:model', async function(req, res){
//     console.log("get", req.params);
//     res.json("hello world");
// });
//
// route.put('/:model/:id', async function(req, res){
//     console.log("get", req.params);
//     res.json("hello world");
// });
//
// route.delete('/:model/:id', async function(req, res){
//     console.log("get", req.params);
//     res.json("hello world");
// });

let initializer = modelRestfulHelper('travelPolicy', {methods: ["find"]});
initializer(route);


// modelRestfulHelper('travelPolicyRegion', {});
// modelRestfulHelper('subsidyTemplate', {});
// modelRestfulHelper('companyRegion', {});
// modelRestfulHelper('regionPlace', {});
// modelRestfulHelper('budget', {methods: ["create"]})

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




