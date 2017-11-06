/**
 * Created by mr_squirrel on 01/09/2017.
 */


var request = require("request");
import config = require("@jingli/config");



export class RestfulAPIUtil {

    async operateOnModel(options: {
        model: string,
        params?: any,
        addUrl?: string
    }):Promise<any> {
        let {params, model, addUrl = ''} = options;
        let {fields, method} = params;
        
        let url = config.cloudAPI + `/${model}`;
        if(addUrl){
            url += `/${addUrl}`
        }
        let result: any;

        let qs: {
            [index: string]: string;
        } = {};

        if (fields.hasOwnProperty('id')) {
            url = url + `/${fields['id']}`;
        }else{
            if (method.toUpperCase() == 'GET') {
                url = url + "?";
                for (let key in fields) {
                   qs[key] = fields[key];
                }
            }
        }

        return new Promise((resolve, reject) => {
            return request({
                uri: url,
                body: fields,
                json: true,
                method: method,
                qs: qs
            }, (err, resp, result) => {
                if (err) {
                    return reject(err);
                }
                if (typeof(result) == 'string') {
                    result = JSON.parse(result);
                }
                return resolve(result);
            });
        })
    }

    async proxyHttp(params:{
        url:string;
        body?:object;
        method:string;
        qs?:object;
    }){
        let {url, body={}, method="get", qs={}} = params;
        return new Promise((resolve, reject) => {
            request({
                uri: config.placeAPI + url,
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