update travel_policy.company_regions set types = '[1,2,3]', "group" = 1 where name = '国内';
update travel_policy.company_regions set types = '[1,2,3]', "group" = 2 where name = '国际';
update travel_policy.company_regions set types = '[1,2,3]', "group" = 2 where name = '港澳台';
update travel_policy.company_regions set types = '[2,3]', "group" = 1 where name = '中国一类地区';
update travel_policy.company_regions set types = '[2,3]', "group" = 1 where name = '中国二类地区';