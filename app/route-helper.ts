/**
 * Created by dev on 2017/8/17.
 */

import { Models} from "_types";

export function Router(path, method, options) {
    return function(fnName, obj, desc) {
        let fn = desc.value;
        fn.path = path;
        fn.method = method;
        fn.options = options;
    }
}

export function modelRestfulHelper(model, options) {
    let mountUrl = options.mountUrl || '/' + model;
    let idUrl = mountUrl + '/:id';
    let methods = options.methods;
    
    return function(app) {
        console.log("======> hello world");
        if (methods && (methods && methods.indexOf("find") >= 0)) {
            console.log("mountUrl: ", mountUrl)
            app.get(idUrl, (req, res, next) => {
                console.log("====> travelpOLICY");
                res.json("hello world");
                // return Models[model].find()
            })
        }
        
        if (methods && (methods && methods.indexOf("create")) >= 0) {
            app.post(mountUrl, (req, res, next) => {
            })
        }

        // app.get(idUrl, (req, res, next) => {
        // })
        //
        // app.delete(idUrl, (req, res, next) => {})
    }
}
