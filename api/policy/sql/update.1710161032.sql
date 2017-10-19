update travel_policy.travel_policy_regions set traffic_prefer = 50
where traffic_prefer is null or hotel_prefer = -1;

update travel_policy.travel_policy_regions set hotel_prefer = 50
where hotel_prefer is null or hotel_prefer = -1;