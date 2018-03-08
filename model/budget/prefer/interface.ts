
/**
 * Created by wlh on 2018/3/8.
 */
'use strict';
const config = require("@jingli/config");

export interface ICity {
    name: string;
    id: string;
    isAbroad: boolean;
    letter: string;
    timezone: string;
    longitude: number;
    latitude: number;
    code?: string;  //三字码
    parentId: string;
    pinyin: string;
    countryCode: string;
    fcode: string;
    ctripCode?: string;
}
export interface IFinalHotel {
    name: string;
    latitude: string;
    longitude: string;
    star: number;
    agent: string;
    price: number;
    bookUrl?: string;
    deeplinkData?: object;
    score?: number;
    reasons?: string[];
    checkInDate: string;
    checkOutDate: string;
    outPriceRange: boolean;
    commentScore?: number;
}

export interface IFinalTicket {
    No: string;   //航班号或者车次
    departDateTime: string; //出发时间
    arrivalDateTime: string;    //到达时间
    originPlace: string;    //出发城市
    destination: string;    //目的地
    duration: number;
    originStation?: string; //出发机场或者车站
    destinationStation?: string;    //目的地机场或者车站
    type: ETrafficType,
    agent: string;
    cabin: string;
    price: number;
    score?: number;
    reasons?: string[];
    stops?: string[];
    segs?: any[];
    bookUrl?: string;
    deeplinkData?: object;
    carry?: string;
}

export enum ETrafficType {
    TRAIN = 0,
    PLANE = 1,
    SHIP = 2,
    CAR = 3,
    BUS = 4,
    SELF_DRIVER = 5,
    CAR_RENT = 6,
}


export interface IFlightSeg {
    deptAirport: IAirport,
    arriAirport: IAirport,
    deptDateTime: Date,
    arriDateTime: Date,
    craft: ICraft;
    base: {
        flgno: string,
        aircode: string,
        logourl: string,
        airsname: string,
        ishared: boolean,
    }
}


export interface ICraft {
    kind: string;
    series: string;
    name: string;
}

export interface IAirport {
    name: string;
    city: string;
    code: string;
    bname: string;
}






export class CityService {

    static async getCity(id): Promise<ICity> {
        if (id == 0) {
            id = 1;
        }
        let city: ICity;
        let uri = config.placeAPI + "/city/" + id;
        let result: any = await restfulAPIUtil.proxyHttp({
            uri,
            method: 'GET'
        });

        if (result.code != 0) {
            throw new Error("place服务地点不存在 : " + id);
        }
        city = <ICity>result.data;
        city.isAbroad = !(city.countryCode == "CN");

        const alternate: any = await restfulAPIUtil.proxyHttp({
            uri: config.placeAPI + `/city/${id}/alternate`,
            method: 'GET'
        });
        for (let item of alternate.data) {
            if (item.lang == "ctripcode") {
                city.ctripCode = item.value;
                break;
            }
        }
        return city;
    }

    static async findCities(options): Promise<any> {
        let result: any = await restfulAPIUtil.proxyHttp({ uri: config.placeAPI + `/city/bywhere`, method: 'GET', qs: options });
        if (result.code == 0) {
            return result.data;
        }
        return null;
    }

    /**
     * 根据城市id向上获取有火车站或机场的城市信息
     * @param params
     * @returns {Promise<any | any | any>}
     */
    static async getSuperiorCityInfo(params: { cityId: string }): Promise<ICity> {
        let self = this;
        let cityId = params.cityId;
        if (!cityId) {
            throw L.ERR.ERROR_CODE_C(500, "城市不存在");
        }
        let city = await this.getCity(cityId);

        if (!city) {
            throw L.ERR.ERROR_CODE_C(500, "城市不存在");
        }
        if (city.fcode == "AIRP" || city.fcode == "RSTN") {
            let parentCity = await this.getCity(city.parentId);
            return parentCity;
        }
        let child_cities = await this.findCities({
            where: { parentId: city.id, fcode: ["AIRP", "RSTN"] }
        });
        if (child_cities && child_cities.length) {
            return city;
        }
        let deg = new Degree(parseFloat(city.latitude + ""), parseFloat(city.longitude + ""));
        let result = CoordDispose.GetDegreeCoordinates(deg, 100);
        let nearbyStations: any[] = await this.findCities({
            where: {
                lat: {
                    $gte: result["lat_min"],
                    $lte: result["lat_max"]
                },
                lng: {
                    $gte: result["lng_min"],
                    $lte: result["lng_max"]
                },
                fcode: ["AIRP", "RSTN"]
            }
        });

        nearbyStations = nearbyStations.filter((item: any) => {
            if (item.fcode == "AIRP") {
                return item.countryCode == city.countryCode;
            } else {
                return item.countryCode == city.countryCode;
            }
        });

        if (nearbyStations && nearbyStations.length) {
            orderByDistance(deg, nearbyStations);
            let parentCity = await this.getCity(nearbyStations[0].parentId);
            return parentCity;
        }

        if (city.parentId == '0') {
            //at the Global.
            return null;
        }
        let returnResult = await self.getSuperiorCityInfo({ cityId: city.parentId });
        return returnResult;
    }

    /* 转换新版placeId 为老版本 */
    static async getTransferCity(id: string): Promise<string> {
        let CT_reg = /CT/ig;
        let D_reg = /^\d+$/ig;

        if (CT_reg.test(id)) {
            return id;
        } else if (D_reg.test(id)) {
            //进入处理逻辑
        } else {
            return id;
        }

        try {
            let getRequest = await request({
                uri: config.placeAPI + "/city/" + id + "/alternate/jlcityid",
                method: "get",
                json: true
            });
            if (getRequest.code == 0) {
                return getRequest.data.value;
            } else {
                return id;
            }
        } catch (e) {
            return id;
        }
    }
}




function orderByDistance(deg: Degree, nearbyStations: any) {
    nearbyStations.forEach((item) => {
        let degItem = new Degree(parseFloat(item.latitude + ""), parseFloat(item.longitude + ""));
        let distance = CoordDispose.GetDistanceGoogle(deg, degItem);
        item.distance = distance;
    })
    nearbyStations.sort((item1, item2) => {
        return item1.distance - item2.distance;
    });
}

// 经纬度坐标
export class Degree {
    public X: number;
    public Y: number;
    constructor(lat: number, lng: number) {
        this.X = lat;
        this.Y = lng;
    }
}
export var EARTH_RADIUS = 6378137.0;//地球半径(米)
export class CoordDispose {
    // 角度数转换为弧度公式
    private static radians(d) {
        return d * Math.PI / 180.0;
    }

    // 弧度转换为角度数公式
    private static degrees(d) {
        return d * (180 / Math.PI);
    }
    // 计算两个经纬度之间的直接距离
    public static GetDistance(Degree1, Degree2) {
        var radLat1 = this.radians(Degree1.X);
        var radLat2 = this.radians(Degree2.X);
        var a = radLat1 - radLat2;
        var b = this.radians(Degree1.Y) - this.radians(Degree2.Y);
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * EARTH_RADIUS;
        s = Math.round(s * 10000) / 10000;
        return s;
    }
    // 计算两个经纬度之间的直接距离(google 算法)
    public static GetDistanceGoogle(Degree1, Degree2) {
        var radLat1 = this.radians(Degree1.X);
        var radLng1 = this.radians(Degree1.Y);
        var radLat2 = this.radians(Degree2.X);
        var radLng2 = this.radians(Degree2.Y);
        var s = Math.acos(Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radLng1 - radLng2) + Math.sin(radLat1) * Math.sin(radLat2));
        s = s * EARTH_RADIUS;
        s = Math.round(s * 10000) / 10000;
        return s;
    }
    // 以一个经纬度为中心计算出四个顶点
    public static GetDegreeCoordinates(Degree1, distance) {
        distance = distance * 1000;
        var dlng = 2 * Math.asin(Math.sin(distance / (2 * EARTH_RADIUS)) / Math.cos(Degree1.X));
        dlng = Math.abs(this.degrees(dlng));//一定转换成角度数  原PHP文章这个地方说的不清楚根本不正确 后来lz又查了很多资料终于搞定了
        var dlat = distance / EARTH_RADIUS;
        dlat = Math.abs(this.degrees(dlat));//一定转换成角度数
        /*  console.info("result===============",{
             lat_min: Degree1.X - dlat,
             lat_max: Degree1.X + dlat,
             lng_min: Degree1.Y - dlng,
             lng_max: Degree1.Y + dlng
         }); */
        //left-top, left-bottom, right-top, right-bottom
        return {
            lat_min: Degree1.X - dlat,
            lat_max: Degree1.X + dlat,
            lng_min: Degree1.Y - dlng,
            lng_max: Degree1.Y + dlng
        };
    }
}


export class RestfulAPIUtil {

    async proxyHttp(params: { uri: string, body?: any, method?: string, qs?: any, json?: boolean }) {
        params.json = true;
        try {
            let result = await request(params);
            if (typeof result == "string") {
                return JSON.parse(result);
            }
            return result;
        } catch (e) {
            console.log("proxyHttp ======> ", params);
            throw new Error(e.message || e);
        }
    }
}


export let restfulAPIUtil = new RestfulAPIUtil();