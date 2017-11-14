
export interface ResponseBodyFunc {
    (req: any, res: any, next?: any): Promise<any>;
}


export function autoSignReply() {
    return function (target, propertyKey, desc) {
        let fn: ResponseBodyFunc = desc.value;
        desc.value = async function (req, res, next) {
            let oldReply = this.reply;
            this.reply = (code: number, data: Object, key?: string) => {
                key = key || req.session.appSecret;
                data = code == 0 ? data : null
                return oldReply.bind(this)(code, data, key)
            }
            return fn.bind(this)(req, res, next);
        }
    }
}
