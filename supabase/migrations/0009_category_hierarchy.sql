alter table categories
  add column if not exists parent_id uuid references categories(id) on delete set null;

create index if not exists categories_parent_id_idx on categories(parent_id);

create or replace function category_has_children(category_uuid uuid)
returns boolean language sql stable as $$
  select exists(select 1 from categories c where c.parent_id = category_uuid);
$$;

create or replace function prevent_category_cycle()
returns trigger language plpgsql as $$
declare cursor_id uuid;
begin
  if new.parent_id is null then
    return new;
  end if;
  if new.parent_id = new.id then
    raise exception 'Category cannot be its own parent';
  end if;

  cursor_id := new.parent_id;
  while cursor_id is not null loop
    if cursor_id = new.id then
      raise exception 'Circular category hierarchy is not allowed';
    end if;
    select parent_id into cursor_id from categories where id = cursor_id;
  end loop;
  return new;
end;
$$;

drop trigger if exists trg_prevent_category_cycle on categories;
create trigger trg_prevent_category_cycle
before insert or update of parent_id on categories
for each row execute function prevent_category_cycle();

create or replace function enforce_leaf_category_usage()
returns trigger language plpgsql as $$
begin
  if exists(select 1 from categories c where c.parent_id = new.category_id) then
    raise exception 'Only leaf categories can be assigned';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_products_leaf_category on products;
create trigger trg_products_leaf_category
before insert or update of category_id on products
for each row execute function enforce_leaf_category_usage();

create or replace function enforce_leaf_template_category()
returns trigger language plpgsql as $$
begin
  if exists(select 1 from categories c where c.parent_id = new.category_id) then
    raise exception 'Specification templates can only be attached to leaf categories';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_templates_leaf_category on specification_groups;
create trigger trg_templates_leaf_category
before insert or update of category_id on specification_groups
for each row execute function enforce_leaf_template_category();

create or replace function detach_template_when_category_becomes_parent()
returns trigger language plpgsql as $$
begin
  if new.parent_id is distinct from old.parent_id and new.parent_id is not null then
    delete from specification_groups where category_id = old.id;
  end if;
  return new;
end;
$$;
-- cleanup template if category changed to parent by another row insert/update
create or replace function cleanup_parent_template()
returns trigger language plpgsql as $$
begin
  delete from specification_groups where category_id = new.parent_id and exists(select 1 from categories c where c.parent_id = new.parent_id limit 1);
  return new;
end;
$$;

drop trigger if exists trg_cleanup_parent_template on categories;
create trigger trg_cleanup_parent_template
after insert or update of parent_id on categories
for each row
when (new.parent_id is not null)
execute function cleanup_parent_template();
