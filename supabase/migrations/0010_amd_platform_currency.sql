alter table product_offers
  alter column currency set default 'AMD';

update product_offers
set currency = 'AMD'
where currency is null or currency <> 'AMD';

alter table product_offers
  add constraint product_offers_currency_amd_check check (currency = 'AMD');
