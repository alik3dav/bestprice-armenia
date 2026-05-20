alter table profiles
add column if not exists merchant_access_level text check (merchant_access_level in ('owner','manager','staff'));
