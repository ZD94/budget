/**
 * Created by lsw on 31/10/2017.
 */

var request = require("request");
var Config = require("@jingli/config");

export class RestfulAPIUtil {

    async proxyHttp(params: { uri: string, body?: any, method?: string, qs?: any } 
        = { uri: '', body: {}, method: "get", qs: {} }) {
        return new Promise((resolve, reject) => {
            request({ ...params, uri: Config.placeAPI + params.uri }, (err, resp, result) => {
                if (err) {
                    return reject(err);
                }

                if (typeof result == 'string') {
                    result = JSON.parse(result);
                }
                return resolve(result);
            });
        })
    }
}


export let restfulAPIUtil = new RestfulAPIUtil();