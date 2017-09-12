/**
 * Created by hxs on 17/9/12.
 */


let path = require("path");
require("ts-node").register({});
require('app-module-path').addPath(path.join(__dirname, "../../"));

let supertest = require("supertest");
// let app = require("../../server");

// let request = supertest(app);

let request = require("request");
let moment = require("moment");
let uuid = require("uuid");
let expect = require("chai").expect;
let md5 = require("md5");

let ticket;

describe("1) 测试登录接口", function(){

    //account 都是创建人
    let account = {
        username : '15210593322',
        password : '123456'
    }

    account.password = md5(account.password);
    let timestamp = +new Date();

    let string = [account.username, account.password, timestamp].join("|");
    let sign = md5(string);

    it("#发起登录请求，应该返回ticket", (done)=>{
        request.post("http://localhost:3001/api/v1/auth/login", {
            headers : {
                key : "jinglicloud2017"
            },
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
            console.log(result);
            expect(result.code).to.be.equal(0);
            ticket = result.data.ticket;
            done();          
        });
    });
});

 describe("2)公司测试接口", ()=>{
    let companies;
    it("#获取公司列表", (done)=>{
        setTimeout(()=>{
            console.log("go", ticket);
            request.get("http://localhost:3001/api/v1/company", {
                headers : {
                    key : "jinglicloud2017",
                    ticket
                }
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
                companies = result.data;
                expect(result.code).to.be.equal(0);
                done();  
            });
        }, 500);
    });

    it("#绑定公司到后台", (done)=>{
        setTimeout(()=>{
            let company = companies[0];
            console.log("公司名称: ", company.name);
            request.post("http://localhost:3001/api/v1/company/bindcompany", {
                headers : {
                    key : "jinglicloud2017",
                    ticket
                },
                form:{
                    companyId : company.id
                }
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
                company = result.data;
                expect(result.code).to.be.equal(0);
                done();  
            });
        }, 1000);
    });

});
    
