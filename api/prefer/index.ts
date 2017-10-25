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
    let regionPlaces = await Models.regionPlace.all({
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

export async function manage(companyRegions:string[], cityCode:string, checkOptions:{params,checkFn:Function}) : Promise<any>{
    let regionPlace, isOk = false;
    let {checkFn, params} = checkOptions;
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

        params.regionPlace = regionPlace;
        let result = await checkFn(params);
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

/* 差旅偏好 check函数, 返回最终prefer */
async function checkPrefer(params:{
    regionPlace: RegionPlace
}){
    let {regionPlace} = params;
    let prefer = await Models.preferRegion.get(regionPlace["companyRegion"]["id"]);

    let targetPrefer;
    targetPrefer = prefer && prefer.budgetConfig;

    if(targetPrefer){
        return targetPrefer;
    }

    return null;
}


/* 获取一个合适的偏好 */
export async function getSuitablePrefer(params:{companyId:string, placeId:string}){
    let {companyId, placeId} = params;
    let companyRegions = await Models.companyRegion.all({where : { companyId }});
    let companyRegionIds = [];
    companyRegions.map((item)=>{
        companyRegionIds.push(item.id);
    });

    let targetPrefer = await manage(companyRegionIds, placeId, {
            params: {

            },
            checkFn : checkPrefer
        }) || null;

    if(!targetPrefer){
        //placeId 找到顶层也没有与当前travelPolicyId 匹配的 prefer设置
        targetPrefer = {};
    }

    return targetPrefer;
}

