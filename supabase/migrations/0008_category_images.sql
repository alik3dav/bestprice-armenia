alter table categories
add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('category-images', 'category-images', true)
on conflict (id) do nothing;

create policy "admin upload category images" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'category-images'
  and is_admin()
);

create policy "admin update category images" on storage.objects
for update to authenticated
using (
  bucket_id = 'category-images'
  and is_admin()
)
with check (
  bucket_id = 'category-images'
  and is_admin()
);

create policy "admin delete category images" on storage.objects
for delete to authenticated
using (
  bucket_id = 'category-images'
  and is_admin()
);

create policy "public read category images" on storage.objects
for select
using (bucket_id = 'category-images');
