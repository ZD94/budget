import {DefaultRegionId} from '_types/policy/travelPolicy';
import {Sequelize, Transaction} from "sequelize";
import { ICity } from '_types/city';
import { RegionPlace } from '_types/policy';
var sequelize = require("sequelize");
const config = require("@jingli/config");
const request = require("request-promise");

export var OldDefaultRegionId = {
    domestic: 'CTW_5',
    abroad:  'Global'
}
/**
 * @method 更新regionPlace中的地点信息改为新版地点信息
 * @param DB {sequelize}
 * @param t {transaction}
 */
export default async function update(DB: Sequelize, t: Transaction) {

    let sql = `select * from travel_policy.region_places where deleted_at is null;`;

    let regionPlaces = await DB.query(sql, {type: sequelize.QueryTypes.SELECT});
    let placeIds = [];
    regionPlaces.map(async function(regionPlace: RegionPlace) {
        if(placeIds.indexOf(regionPlace.place_id) < 0) {
            placeIds.push(regionPlace.place_id)
        }
        return;
    })
    for(let i = 0; i < placeIds.length; i++) {
        let placeId = placeIds[i];
        if(placeId == OldDefaultRegionId.abroad) {
            let updateSql = `update travel_policy.region_places set place_id = '${1}', updated_at = now() where place_id = '${placeId}';`;
            await DB.query(updateSql);
        }
        if(/^CT[W]?_\d+$/.test(placeId)) {
            let place = await getCity(placeId);
            if(place && place.id) {    
                let updateSql = `update travel_policy.region_places set place_id = '${place.id}', updated_at = now() where place_id = '${placeId}';`;
                await DB.query(updateSql);
            }
        }
    }
    console.log("place_id updated successfully")
    return true;
}


async function getCity(id): Promise<ICity> {
    if (id == OldDefaultRegionId.abroad) {
        return null;
    }
    let city: ICity;
    let uri = config.placeAPI + "/city/" + id;
    let result;
    try {
        result = await request({
            uri,
            method: "get",
            json: true
        });
    } catch (e) {
        console.error("place 服务获取地点失败 : ", id);
        return null;
    }
    if(typeof result == 'string') {
        result = JSON.parse(result);
    }
    if (result.code != 0) {
        console.error("=====place 服务获取地点失败 : ", id);
        return null;
    }
    city = <ICity>result.data;
    city.isAbroad = !(city.countryCode == "CN");

    return city;
}