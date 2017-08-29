/**
 * Created by wlh on 2017/8/29.
 */

'use strict';
import {IController} from "./IController";

export const ERROR_MSG = {
    0: 'ok'
}

export abstract class AbstractController implements IController {

    reply(code: number, data: any) {
        return {
            code: code,
            data: data,
            msg: ERROR_MSG[code]
        }
    }
}