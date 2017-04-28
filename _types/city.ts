/**
 * Created by wlh on 2017/3/13.
 */

'use strict';

export interface ICity {
    name: string;
    id: string;
    isAbroad: boolean;
    letter: string;
    code?: string;  //三字码
    longitude?: number;
    latitude?: number;
}