-- Allow authenticated users to read/update their own profile row.
-- This unblocks role lookups during login while keeping admin-only management for other rows.

create policy "users can read own profile" on profiles
for select
using (auth.uid() = id);

create policy "users can update own profile" on profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);
