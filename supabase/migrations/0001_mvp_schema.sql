create extension if not exists "pgcrypto";

create type app_role as enum ('admin','merchant','user');
create type record_status as enum ('draft','active','archived');
create type offer_stock_status as enum ('in_stock','limited','out_of_stock','preorder');
create type spec_field_type as enum ('text','number','boolean','select');

create table roles (
  id uuid primary key default gen_random_uuid(),
  name app_role unique not null,
  created_at timestamptz not null default now()
);

insert into roles (name) values ('admin'),('merchant'),('user') on conflict do nothing;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role app_role not null default 'user',
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  status record_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table brands (id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique, created_at timestamptz not null default now());
create table merchants (id uuid primary key default gen_random_uuid(), profile_id uuid unique references profiles(id) on delete set null, name text not null, slug text not null unique, status record_status not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table products (id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, brand_id uuid references brands(id), model text, category_id uuid not null references categories(id), images jsonb not null default '[]'::jsonb, description text, status record_status not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table product_offers (id uuid primary key default gen_random_uuid(), merchant_id uuid not null references merchants(id) on delete cascade, product_id uuid not null references products(id) on delete cascade, price numeric(12,2) not null check (price >= 0), currency text not null default 'EUR', stock_status offer_stock_status not null default 'in_stock', product_url text not null, delivery_info text, warranty_info text, status record_status not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(merchant_id,product_id,product_url));
create table specification_groups (id uuid primary key default gen_random_uuid(), category_id uuid not null references categories(id) on delete cascade, name text not null, sort_order int not null default 0, created_at timestamptz not null default now(), unique(category_id,name));
create table specification_fields (id uuid primary key default gen_random_uuid(), group_id uuid not null references specification_groups(id) on delete cascade, name text not null, key text not null, field_type spec_field_type not null default 'text', options jsonb, required boolean not null default false, sort_order int not null default 0, created_at timestamptz not null default now(), unique(group_id,key));
create table product_specification_values (id uuid primary key default gen_random_uuid(), product_id uuid not null references products(id) on delete cascade, field_id uuid not null references specification_fields(id) on delete cascade, value_text text, value_number numeric(14,4), value_boolean boolean, value_select text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(product_id, field_id));

alter table profiles enable row level security;
alter table categories enable row level security;
alter table brands enable row level security;
alter table merchants enable row level security;
alter table products enable row level security;
alter table product_offers enable row level security;
alter table specification_groups enable row level security;
alter table specification_fields enable row level security;
alter table product_specification_values enable row level security;

create function is_admin() returns boolean language sql stable as $$
  select exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

create policy "admin full access profiles" on profiles for all using (is_admin()) with check (is_admin());
create policy "admin full access categories" on categories for all using (is_admin()) with check (is_admin());
create policy "admin full access brands" on brands for all using (is_admin()) with check (is_admin());
create policy "admin full access merchants" on merchants for all using (is_admin()) with check (is_admin());
create policy "admin full access products" on products for all using (is_admin()) with check (is_admin());
create policy "admin full access offers" on product_offers for all using (is_admin()) with check (is_admin());
create policy "admin full access spec groups" on specification_groups for all using (is_admin()) with check (is_admin());
create policy "admin full access spec fields" on specification_fields for all using (is_admin()) with check (is_admin());
create policy "admin full access spec values" on product_specification_values for all using (is_admin()) with check (is_admin());

create policy "merchant own offers" on product_offers
for all using (
  exists (
    select 1 from merchants m join profiles p on p.id = m.profile_id
    where m.id = merchant_id and p.id = auth.uid() and p.role = 'merchant'
  )
)
with check (
  exists (
    select 1 from merchants m join profiles p on p.id = m.profile_id
    where m.id = merchant_id and p.id = auth.uid() and p.role = 'merchant'
  )
);

create policy "public read active products" on products for select using (status = 'active');
create policy "public read active offers" on product_offers for select using (status = 'active');
create policy "public read active categories" on categories for select using (status = 'active');
create policy "public read offer brands" on brands for select using (true);
