/**
 * Created by wlh on 2017/8/25.
 */

'use strict';

import http = require("http");
import v1 = require('./v1');

export function initHttp(app) {
    app.use('/api/v1', v1);
}