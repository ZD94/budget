/**
 * Created by wlh on 2017/11/1.
 */

'use strict';

var host = 'http://localhost:4003';
var prefix = '/api/v1'
import fs = require("fs");

let storage = {
    filename: 'token.txt'
};

export function getFullPath(url: string) {
    let fullUrl =  host + prefix + url;
    return fullUrl;
}

export function setToken(ticket) {
    fs.writeFileSync(storage.filename, ticket);
}

export function getToken() {
    var bfs = fs.readFileSync(storage.filename)
    return bfs.toString();
}
