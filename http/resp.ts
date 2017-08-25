/**
 * Created by wlh on 2017/5/10.
 */

'use strict';

import _ = require("lodash");

const template = {
    code: 0,
    errmsg: '',
    data: {}
};

/**
 * 响应模板信息为:
 * ```
 *     {
 *         "code": "CODE",
 *         "errmsg": "错误信息",
 *         "data": "具体信息"
 *     }
 * ```
 * @param {Request} req
 * @param {Response} res
 * @param next
 */
function commonResp(req: any, res: any, next: any) {
    res.openapiRes = function (code, errmsg, data) {
        if (typeof errmsg == 'object') {
            data = errmsg;
            errmsg = '';
        }
        let respData = _.cloneDeep(template);
        respData.code = code;
        respData.errmsg = errmsg;
        respData.data = data;
        res.json(respData);
    }
    return next();
}

export= commonResp;