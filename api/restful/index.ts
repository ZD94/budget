/**
 * Created by lsw on 31/10/2017.
 */

var request = require("request");
var Config = require("@jingli/config");

export class RestfulAPIUtil {

    async proxyHttp(params:{
        url:string;
        body?:object;
        method:string;
        qs?:object;
    }){
        let {url, body={}, method="get", qs={}} = params;
        return new Promise((resolve, reject) => {
            request({
                uri: Config.placeAPI + url,
                body,
                json: true,
                method,
                qs
            }, (err, resp, result) => {
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