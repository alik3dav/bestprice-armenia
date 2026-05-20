create policy "merchant read own merchant" on merchants
for select using (
  exists (
    select 1 from profiles p
    where p.id = merchants.profile_id
      and p.id = auth.uid()
      and p.role = 'merchant'
  )
);
