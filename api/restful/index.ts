/*
 * @Author: Mr.He 
 * @Date: 2018-02-05 14:52:14 
 * @Last Modified by: Mr.He
 * @Last Modified time: 2018-02-05 15:26:48
 * @content what is the content of this file. */


var request = require("request-promise");
var Config = require("@jingli/config");

export class RestfulAPIUtil {

    async proxyHttp(params: { uri: string, body?: any, method?: string, qs?: any, json?: boolean }) {
        params.json = true;
        try {
            let result = await request(params);
            if (typeof result == "string") {
                return JSON.parse(result);
            }
            return result;
        } catch (e) {
            console.log("proxyHttp ======> ", params);
            throw new Error(e.message || e);
        }
    }
}


export default new RestfulAPIUtil();