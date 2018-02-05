/**
 * Created by lsw on 31/10/2017.
 */

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
            throw new Error(e);
        }
    }
}


export let restfulAPIUtil = new RestfulAPIUtil();