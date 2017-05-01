/**
 * Created by wlh on 2017/4/26.
 */

'use strict';
import {IStaff, EGender} from "_types/budget";
import moment = require("moment");

export function countRoom(staffs: IStaff[], combineRoom?: boolean) {
    if (!combineRoom) {
        combineRoom = false;
    }
    if (!combineRoom) {
        return staffs.length;
    }

    let maleNums = 0;
    let femaleNums = 0;
    staffs.forEach( (staff) => {
        if (staff.gender == EGender.MALE) {
            maleNums++
            return;
        }
        femaleNums++;
    });
    return Math.ceil(maleNums/ 2) + Math.ceil(femaleNums / 2);
}

export function countDays(endTime: Date, beginTime: Date) : number {
    let dateFormat = 'YYYY-MM-DD'
    let days =  moment(moment(endTime).format(dateFormat))
        .diff(moment(beginTime).format(dateFormat), 'days');
    if (days < 0) {
        throw new Error('can not endTime  < beginTime');
    }
    return days;
}