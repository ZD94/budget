update travel_policy.company_regions set types = '[1,2,3]', "group" = 2
    where name = '国际' and (types is null or "group" is null or "group" !=2 ) and deleted_at is null;

update travel_policy.company_regions set types = '[1,2,3]', "group" = 2
    where name = '港澳台' and (types is null or "group" is null or "group" !=2 ) and deleted_at is null;

update travel_policy.company_regions set types = '[1,2,3]', "group" = 1
    where name = '国内' and (types is null or "group" is null or "group" !=1 ) and deleted_at is null;