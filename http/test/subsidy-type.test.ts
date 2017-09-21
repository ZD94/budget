/**
 * Created by wlh on 2017/4/20.
 */
'use strict';

const request = require("supertest");
var assert = require("assert");
var prefixUrl = '/api/v1'

let target = 'http://localhost:80';

describe("subsidyType.ts", function() {


    /*it(`GET ${prefixUrl}/subsidyType should be ok with keyword `, function(done) {
       var data = {
           keyword: '洗衣费'
       }
       request(target)
           .get(prefixUrl + '/subsidyType?name=洗衣费')
           .end( (err, resp) => {
               console.info(err, "err=======");
               if (err) throw err;
               let result = resp.body;
               console.log(result);
               assert.equal(result.code, 0);
               done();
           })
   })

  it(`GET ${prefixUrl}/subsidyType/:id should be ok with ID`, (done)=> {
       let data = {};
       request(target)
           .get(prefixUrl + '/subsidyType/afc4b2c0-22fe-11e6-bd48-e7eec3e966cb')
           .end( (err, resp) => {
               if (err) throw err;
               let result = resp.body;
               assert.equal(result.code, 0);
               assert.equal(result.data.length, 1);
               assert.equal(result.data[0].name, '餐补');
               done();
           })
   })*/

   var id = 'afc4b2c0-22fe-11e6-bd48-e7eec3e966cb';

   it(`POST ${prefixUrl}/budget should be ok`, function(done) {
       this.timeout(6 * 1000)

       var params = {
           name: "洗衣费",
           companyId: id,
           period: 7
       }
       request(target)
           .post(prefixUrl + '/subsidyType')
           .set("content-type", "application/json")
           .send(JSON.stringify(params))
           .end( (err, resp) => {
               if (err) throw err;
               let result = resp.body;
               // console.log("Result==>", resp)
               assert.equal(resp.statusCode, 200);
               assert.equal(resp.body.code, 0);
               id = result.data.id
               done();
           })
   })
})