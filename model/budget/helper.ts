/**
 * Created by wlh on 2017/4/26.
 */

'use strict';
import { IStaff, EGender } from "_types/budget";
const moment = require("moment");
import 'moment-timezone';
import { Models } from "_types";

export function countRoom(staffs: IStaff[], combineRoom?: boolean) {
    if (!combineRoom) {
        combineRoom = false;
    }
    if (!combineRoom) {
        return staffs.length;
    }

    let maleNums = 0;
    let femaleNums = 0;
    staffs.forEach((staff) => {
        if (staff.gender == EGender.MALE) {
            maleNums++
            return;
        }
        femaleNums++;
    });
    return Math.ceil(maleNums / 2) + Math.ceil(femaleNums / 2);
}

export function countDays(endTime: Date, beginTime: Date, timezone: string): number {
    let dateFormat = 'YYYY-MM-DD'
    let endTimeStr = moment(endTime).tz(timezone).format(dateFormat)
    let beginTimeStr = moment(beginTime).tz(timezone).format(dateFormat)
    let days = moment(endTimeStr)
        .diff(beginTimeStr, 'days');
    return days < 0 ? 0 : days;
}

export class BudgetHelps {
    async getBudgetItems(params: { page: number, pageSize: number, type: number }): Promise<BudgetItem[]> {
        let { page = 0, pageSize = 20, type } = params;
        let where: any = {};
        if (type) {
            where.type = type;
        }
        let offset = page * pageSize;
        let pager = await Models.budgetItem.find({ where: where, limit: pageSize, offset: offset, order: [["created_at", "desc"]] });
        return pager;
    }
}