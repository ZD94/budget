/**
 * Created by hxs on 2017/8/29.
 */

'use strict';
import {Models} from "_types/index";
import {CompanyRegion} from "_types/policy/companyRegion";
import {RegionPlace} from "_types/policy/regionPlace";
const API = require("@jingli/dnode-api");

/* ============================= COMMON USING =================================== */
export async function getRegionPlace(companyRegions:string[], placeId:string) : Promise<any>{
    let regionPlaces = await Models.regionPlace.find({
        where : {
            companyRegionId: {
                $in : companyRegions
            },
            placeId
        }
    });

    if(regionPlaces.length){
        return regionPlaces[0];
    }

    return null;
}

export async function getParentCity(cityCode: string) : Promise<any>{
    let cityInfo = await API.place.getCityInfo({cityCode});
    if(!cityInfo.parentId){
        return null;
    }

    return await API.place.getCityInfo({cityCode : cityInfo.parentId});
}

export async function manage(companyRegions:string[], cityCode:string, checkFn:Function) : Promise<any>{
    let regionPlace, isOk = false;
    do{
        regionPlace = await getRegionPlace(companyRegions, cityCode);
        if(!regionPlace){
            let parentCity = await getParentCity(cityCode);
            if(!parentCity){
                //上级地区已经没有了，那就返回null
                return null;
            }
            cityCode = parentCity.id;
            continue;
        }

        let result = await checkFn(regionPlace);
        if(result){
            //验证通过
            isOk = true;
            return result;
        }else{
            let parentCity = await getParentCity(cityCode);
            if(!parentCity){
                //上级地区已经没有了，那就返回null
                return null;
            }
            cityCode = parentCity.id;
        }
    }while(!isOk);
}

/* ============================= COMMON USING END =================================== */

/* 差旅偏好 check函数 */
async function checkPrefer(regionPlace: RegionPlace){
    let prefer = await Models.prefer.find({
        where : {
            companyRegionId : regionPlace.companyRegion.id
        }
    });

    if(prefer.length){
        return prefer;
    }
    return null;
}

/* 获取一个合适的偏好 */
export async function getSuitablePrefer(companyId:string, placeId:string, travelPolicyId:string){
    let companyRegions = await Models.companyRegion.all({where : { companyId }});
    // let prefers = await manage(companyRegions, placeId, checkPrefer);
}