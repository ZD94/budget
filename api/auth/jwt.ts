import {sign, verify} from 'jsonwebtoken';
import * as Bluebird from 'bluebird'

export const EXPIRES = Math.floor(Date.now() / 1000) + 20 * 60;

export const generateToken = async (data, appId, appSecret) => {
    return new Bluebird((resolve, reject) => {
        sign({...data, sub: appId, exp: EXPIRES}, appSecret, {algorithm: 'HS256'}, (err, token) => {
            if (err) return reject(err);
            return resolve(token);
        });
    });
}

export const verifyToken = async (token, appSecret) => {
    return new Bluebird((resolve, reject) => {
        verify(token, appSecret, {algorithms: ['HS256']}, (err, decoded) => {
            if (err) return reject(err);
            return resolve(decoded);
        });
    });
}
