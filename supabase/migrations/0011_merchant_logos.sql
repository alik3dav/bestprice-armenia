alter table merchants
add column if not exists logo_path text;

insert into storage.buckets (id, name, public)
values ('merchant-logos', 'merchant-logos', true)
on conflict (id) do update set public = excluded.public;

create policy "admin upload merchant logos" on storage.objects
for insert
with check (
  bucket_id = 'merchant-logos'
  and is_admin()
);

create policy "admin update merchant logos" on storage.objects
for update
using (
  bucket_id = 'merchant-logos'
  and is_admin()
)
with check (
  bucket_id = 'merchant-logos'
  and is_admin()
);

create policy "admin delete merchant logos" on storage.objects
for delete
using (
  bucket_id = 'merchant-logos'
  and is_admin()
);

create policy "public read merchant logos" on storage.objects
for select
using (bucket_id = 'merchant-logos');
