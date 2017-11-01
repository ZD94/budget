/**
 * Created by hxs on 17/9/12.
 */


import path = require("path");
import supertest = require("supertest");
// let app = require("../../server");

// let request = supertest(app);

import request = require("request");
import moment = require("moment");
import uuid = require("uuid");
var expect = require("chai").expect;
import md5 = require("md5");

var host = 'http://localhost:4003';
var prefix = '/api/v1'

function getFullPath(url) {
    let fullUrl =  host + prefix + url;
    return fullUrl;
}

describe("/auth", function(){

    //account 都是创建人
    let account = {
        username : 'qmtrip@jingli365.com',
        password : '123456'
    }

    account.password = md5(account.password);
    let timestamp = Date.now();

    let string = [account.username, account.password, timestamp].join("|");
    let sign = md5(string);

    let token;
    it("POST /auth/login", (done)=>{
        request.post(getFullPath("/auth/login"), {
            form : {
                sign,
                username : account.username,
                timestamp
            }
        }, function(err, httpResponse, body){
            if(err){
                console.log(err);
                return;
            }
            let result;
            try{
                result = JSON.parse( body );
            }catch(e){
                result = body;
            }
            expect(result.code).to.be.equal(0);
            token = result.data.token;
            done();          
        });
    });


    it("POST /auth/quit", (done)=>{
        request.post(getFullPath("/auth/quit"), {
            headers : {
                token: token
            },
        }, (err, httpResponse, body)=>{
            if(err){
                console.log(err);
                return;
            }

            let result;
            try{
                result = JSON.parse( body );
            }catch(e){
                result = body;
            }
            console.log(result);
            expect(result.code).to.be.equal(0);
            done();
        })
    })
});

