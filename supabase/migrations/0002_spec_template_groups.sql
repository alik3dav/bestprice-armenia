create table specification_template_groups (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references specification_groups(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique(template_id, name)
);

alter table specification_template_groups enable row level security;
create policy "admin full access spec template groups" on specification_template_groups for all using (is_admin()) with check (is_admin());

alter table specification_fields add column template_group_id uuid references specification_template_groups(id) on delete cascade;

update specification_fields set template_group_id = null;

alter table specification_fields alter column group_id drop not null;
alter table specification_fields drop constraint if exists specification_fields_group_id_key;
alter table specification_fields add constraint specification_fields_template_group_id_key_unique unique(template_group_id, key);

-- backfill: create a default group per existing template and attach fields
insert into specification_template_groups (template_id, name, sort_order)
select sg.id, 'General', 0
from specification_groups sg
where not exists (
  select 1 from specification_template_groups stg where stg.template_id = sg.id
);

update specification_fields sf
set template_group_id = stg.id
from specification_template_groups stg
where stg.template_id = sf.group_id
  and sf.template_group_id is null;

alter table specification_fields alter column template_group_id set not null;
