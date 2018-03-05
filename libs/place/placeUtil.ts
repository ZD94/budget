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