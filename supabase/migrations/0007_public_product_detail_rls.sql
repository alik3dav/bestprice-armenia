create policy "public read active merchants"
on merchants for select
using (status = 'active');

create policy "public read spec templates for active categories"
on specification_groups for select
using (
  exists (
    select 1
    from categories c
    where c.id = category_id
      and c.status = 'active'
  )
);

create policy "public read spec template groups"
on specification_template_groups for select
using (
  exists (
    select 1
    from specification_groups sg
    join categories c on c.id = sg.category_id
    where sg.id = template_id
      and c.status = 'active'
  )
);

create policy "public read spec fields"
on specification_fields for select
using (
  exists (
    select 1
    from specification_template_groups stg
    join specification_groups sg on sg.id = stg.template_id
    join categories c on c.id = sg.category_id
    where stg.id = template_group_id
      and c.status = 'active'
  )
);

create policy "public read spec values for active products"
on product_specification_values for select
using (
  exists (
    select 1
    from products p
    where p.id = product_id
      and p.status = 'active'
  )
);
