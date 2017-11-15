import {sign, verify} from 'jsonwebtoken';
import * as config from '@jingli/config';


export const generateToken = async (data: any, appId: string, appSecret: string) => {
    return new Promise((resolve, reject) => {
        let EXPIRES = Date.now() + config.sessionTime * 60 * 1000;
        sign({...data, sub: appId, exp: EXPIRES}, appSecret, {algorithm: 'HS256'}, (err, token) => {
            if (err) return reject(err);
            return resolve(token);
        });
    });
}

export const verifyToken = async (token: string, appSecret: string) => {
    return new Promise((resolve, reject) => {
        verify(token, appSecret, {algorithms: ['HS256']}, (err, decoded) => {
            if (err) return reject(err);
            return resolve(decoded);
        });
    });
}