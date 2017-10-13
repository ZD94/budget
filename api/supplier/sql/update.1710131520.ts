let uid = require("uuid");
var commonSuppliers = [
    {name:"飞猪", logo: 'logo/feizhu.png', enName: '', alias: '飞猪'},
    {name:"去哪儿网", logo: 'logo/qunar.png', enName: 'qunar', alias: '去哪儿'},
    {name:"携程旅行网", logo: 'logo/xiecheng.png', enName: 'ctrip', alias: '携程'},
    {name:"同程旅游", logo: 'logo/tongcheng.png', enName: '', alias: '同程'},
    {name:"KIWI.COM", logo: 'logo/kiwi.png', enName: 'kiwi.com', alias: 'KIWI'},
    {name:"非凡旅行", logo: 'logo/feifan.png', enName: '', alias: '非凡旅行'},
    {name:"欧美嘉旅行网", logo: 'logo/oumeijia.png', enName: '', alias: '欧美嘉'},
    {name:"途牛旅游网", logo: 'logo/tuniu.png', enName: '', alias: '途牛'},
    {name:"Chuangchen Air", logo: 'logo/Chuangchen.png', enName: '', alias: 'Chuangchen Air'},
    {name:"ebookers", logo: 'logo/ebookers.png', enName: '', alias: 'ebookers'},
    {name:"GotoGate", logo: 'logo/gotogate.png', enName: '', alias: 'GotoGate'},
    {name:"Mytrip", logo: 'logo/mytrip.png', enName: '', alias: 'Mytrip'},
    {name:"Travel2Be", logo: 'logo/travel2be.png', enName: '', alias: 'Travel2Be'},
    {name:"Travelgenio", logo: 'logo/travelgenio.png', enName: '', alias: 'Travelgenio'},
    {name:"Travelliker爱遊人", logo: 'logo/travelliker.png', enName: '', alias: 'Travelliker'},
    {name:"Tripsta", logo: 'logo/tripsta.png', enName: '', alias: 'Tripsta'},
    {name:"ebookers", logo: 'logo/ebookers.png', enName: '', alias: 'ebookers'},
    {name:"Tripair", logo: 'logo/tripair.png', enName: '', alias: 'Tripair'},
    {name:"ZUJI", logo: 'logo/zuji.png', enName: '', alias: 'ZUJI'}
];


module.exports =async function(DB, t) {
    commonSuppliers.forEach(async (supplier) => {
        let name = supplier.name;
        let logo = supplier.logo;
        let alias = supplier.alias;
        let enName = supplier.enName;
        let id = uid.v1();

        let sql = `INSERT INTO "supplier"."common_suppliers" ("id", "name","alias", "logo", "created_at", "updated_at") 
        VALUES ('${id}', '${name}', '${alias}', '${logo}', now(), now());`;
        await DB.query(sql);

        if(enName){
            let sq2 = `INSERT INTO supplier.supplier_alternate_names(
            id, common_supplier_id, type, value, created_at, updated_at)
            VALUES ('${uid.v1()}', '${id}', 'budgetInfo', '${enName}', now(), now());`;
            await DB.query(sq2);
        }
    })
}