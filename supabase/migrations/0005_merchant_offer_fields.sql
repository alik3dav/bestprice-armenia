alter table product_offers
  alter column product_url drop not null,
  add column if not exists merchant_sku text,
  add column if not exists notes text,
  add column if not exists created_by uuid references profiles(id) on delete set null;
