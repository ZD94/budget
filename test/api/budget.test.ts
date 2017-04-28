// /**
//  * Created by wlh on 2017/3/10.
//  */
//
// 'use strict';
//
// import ApiTravelBudget = require('api/budget');
// // let {getBudget, getBudgetCache} = ApiTravelBudget;
// import {IQueryBudgetParams, EAirCabin, EGender} from "_types/budget";
// import {ICity} from "_types/city";
//
// let CITY_BJ: ICity = {
//     id: 'CT_131',
//     name: "北京",
//     code: "BJS",
//     isAbroad: false,
//     letter: 'BJ'
// }
//
// let appid = '00000000-0000-0000-0000-000000000001'
//
// let hotels = require("./test-hotels.json");
// let tickets = require("./test-transit-tickets.json");
//
// describe("lib/budget.ts", () => {
//     it("#getBudget() should be oa", (done) => {
//         let params: IQueryBudgetParams = {
//             hotels: hotels,
//             tickets: tickets,
//             isRetMarkedData: true,
//             fromCity: CITY_BJ,
//             appid: appid,
//             ret: true,
//             segs: [
//                 {
//                     city:CITY_BJ,
//                     beginTime: new Date('2017-01-01'),
//                     endTime: new Date('2017-01-01'),
//                     location: {
//                         latitude: 123,
//                         longitude: 46,
//                     }
//                 }
//             ],
//             policies: {
//                 "default": {
//                     cabin: [EAirCabin.ECONOMY],
//                     hotelStar: [],
//                     trainSeat: []
//                 }
//             },
//             staffs: [{
//                 gender: EGender.MALE,
//                 policy: "default"
//             }],
//             combineRoom: false,
//         }
//         return getBudget(params)
//             .then( (result) => {
//                 console.log(JSON.stringify(result))
//                 done();
//             })
//             .catch( (err) => {
//                 throw err
//             })
//     })
//
//     it("#getBudgetCache() should be ok", function(done) {
//         getBudgetCache({appid: appid, id: 'f5d2b840-086b-11e7-b25e-33a5c04dc7af'})
//             .then( (result) => {
//                 console.log(JSON.stringify(result));
//                 done();
//             })
//             .catch( (err) => {
//                 throw err;
//             })
//     })
// })