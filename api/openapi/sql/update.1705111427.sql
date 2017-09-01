INSERT INTO openapi.apps(
            id, name, secret_key, expire_date, connect_user, connect_mobile,
            config, prefer_config, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000001', '测试账号', 'jinglisecret', '2099-01-01', '王丽辉', '155011496**',
            '{}'::jsonb, '{}'::jsonb, now(), now());