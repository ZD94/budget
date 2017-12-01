import {Sequelize, Transaction} from "sequelize";
let suppliers = [
    {fileId: '00000001-0000-0000-0000-000000000001', imageName: 'logo/ctrip.png'},
    {fileId: '00000001-0000-0000-0000-000000000002',imageName: 'logo/bravofly.png'},
    {fileId: '00000001-0000-0000-0000-000000000003',imageName: 'logo/chenguanglvxing.png'},
    {fileId: '00000001-0000-0000-0000-000000000004',imageName: 'logo/ebookers.png'},
    {fileId: '00000001-0000-0000-0000-000000000005',imageName: 'logo/feifan.png'},
    {fileId: '00000001-0000-0000-0000-000000000006',imageName: 'logo/gotogate.png'},
    {fileId: '00000001-0000-0000-0000-000000000007',imageName: 'logo/kiwi.png'},
    {fileId: '00000001-0000-0000-0000-000000000008',imageName: 'logo/mytrip.png'},
    {fileId: '00000001-0000-0000-0000-000000000009',imageName: 'logo/omega.png'},
    {fileId: '00000001-0000-0000-0000-000000000010',imageName: 'logo/piggy.png'},
    {fileId: '00000001-0000-0000-0000-000000000011',imageName: 'logo/qunar.png'},
    {fileId: '00000001-0000-0000-0000-000000000012',imageName: 'logo/tianxun.png'},
    {fileId: '00000001-0000-0000-0000-000000000013',imageName: 'logo/tongcheng.png'},
    {fileId: '00000001-0000-0000-0000-000000000014',imageName: 'logo/travel2be.png'},
    {fileId: '00000001-0000-0000-0000-000000000015',imageName: 'logo/travelgenio.png'},
    {fileId: '00000001-0000-0000-0000-000000000016',imageName: 'logo/travelliker.png'},
    {fileId: '00000001-0000-0000-0000-000000000017',imageName: 'logo/tripair.png'},
    {fileId: '00000001-0000-0000-0000-000000000018',imageName: 'logo/tripsta.png'},
    {fileId: '00000001-0000-0000-0000-000000000019',imageName: 'logo/tuniu.png'},
    {fileId: '00000001-0000-0000-0000-000000000020',imageName: 'logo/zuji.png'}
    ]

    export default async function update(DB: Sequelize, t: Transaction){
    suppliers.forEach(async (supplier) => {
        let fileId = supplier.fileId;
        let imageName = supplier.imageName;
        let sql1 = `update supplier.common_suppliers set logo = '${fileId}' where logo = '${imageName}';`;
        await DB.query(sql1);
    })
}