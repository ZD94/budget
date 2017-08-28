/**
 * Created by wlh on 2017/8/28.
 */

'use strict';

const controllers = {};

export async function getControllers() {
    return controllers;
}

export function Router(url: string, method?: string) {
    return function(target, propertyKey, desc) {
        let fn = desc.value;
        fn.$url = url;
        fn.$method = method || 'GET';
    }
}

export function Restful(mountUrl: string) {
    return function(target) {
        target.prototype.$isValidId = target.prototype.$isValidId || function(id) {
            return /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(id.toString());
        };

        if (!mountUrl) {
            mountUrl = '/' + target.name.replace(/Controller/, '').toLowerCase();
        }
        controllers[mountUrl] = target;
    }
}