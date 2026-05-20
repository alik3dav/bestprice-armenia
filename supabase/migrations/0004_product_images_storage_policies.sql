insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

create policy "admin upload product images" on storage.objects
for insert
with check (
  bucket_id = 'product-images'
  and is_admin()
);

create policy "admin update product images" on storage.objects
for update
using (
  bucket_id = 'product-images'
  and is_admin()
)
with check (
  bucket_id = 'product-images'
  and is_admin()
);

create policy "admin delete product images" on storage.objects
for delete
using (
  bucket_id = 'product-images'
  and is_admin()
);

create policy "public read product images" on storage.objects
for select
using (bucket_id = 'product-images');
