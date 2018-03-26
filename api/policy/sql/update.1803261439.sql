update travel_policy.travel_policies
set is_open_abroad = true
where deleted_at is null;