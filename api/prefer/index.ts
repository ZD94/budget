/**
 * Created by hxs on 2017/8/29.
 */

'use strict';
import {Models} from "_types/index";
import {CompanyRegion} from "_types/policy/companyRegion";
const API = require("@jingli/dnode-api");

/**
 * content 
*/
export async function getCompanyRegions (companyId : string): Promise<CompanyRegion[]>{
    let companyRegions = await Models.companyRegion.all({
        where : {
            companyId
        }
    });

    return companyRegions;
}

/* ============================= COMMON USING =================================== */
export async function getCompanyRegion(companyRegions:string[], placeId:string) : Promise<any>{
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

    let parentCity = await API.place.getCityInfo({cityCode : cityInfo.parentId});
    return parentCity;
}

export async function manage(companyRegions:string[], cityCode, checkFn) : Promise<any>{
    let regionPlace, isOk = false;
    do{
        regionPlace = await getCompanyRegion(companyRegions, cityCode);
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