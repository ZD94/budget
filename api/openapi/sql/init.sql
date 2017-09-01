--schema=openapi

INSERT INTO openapi.apps(
            id, name, secret_key, expire_date, connect_user, connect_mobile,
            config, prefer_config, created_at, updated_at, agent_id)
    VALUES ('00000000-0000-0000-0000-000000000001', '测试账号', 'jinglisecret', '2099-01-01', '王丽辉', '155011496**',
            '{}'::jsonb, '{}'::jsonb, now(), now(), '11111111-1111-1111-1111-000000000001');

insert into openapi.apps (id, name, secret_key, expire_date, connect_user, connect_mobile, config, prefer_config, agent_id, created_at, updated_at)
values( '11111111-1111-1111-1111-000000000001', '鲸力智享', 'jinglizhixiang', '2099-01-01', '王大拿', '1550114****', '{}'::jsonb, '{}'::jsonb, null, now(), now());

