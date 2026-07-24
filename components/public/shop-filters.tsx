"use client";

import { ChevronUp } from "lucide-react";
import { useMemo } from "react";

type SearchParams = Record<string, string | string[] | undefined>;

type SpecFilter = {
  fieldId: string;
  fieldName: string;
  key: string;
  groupName: string;
  options: string[];
};

type Props = {
  params: SearchParams;
  merchantIds: string[];
  specFilters: SpecFilter[];
};

const asArray = (value: string | string[] | undefined) => (Array.isArray(value) ? value : value ? [value] : []);

const inputClassName = "h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-action-blue)] focus:ring-2 focus:ring-[var(--color-action-blue)]/20";

function FilterCard({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-surface)] p-3.5 shadow-[var(--shadow-subtle)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
        <div className="flex items-center gap-2">
          {count ? <span className="rounded-sm bg-[var(--color-header-surface)] px-1.5 py-0.5 text-xs font-medium text-[var(--color-action-blue)]">{count}</span> : null}
          <ChevronUp aria-hidden="true" className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={2} />
        </div>
      </div>
      {children}
    </section>
  );
}

function CheckboxRow({ name, value, label, defaultChecked }: { name: string; value: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 py-1 text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="h-4 w-4 shrink-0 rounded border-[var(--color-border)] text-[var(--color-action-blue)] focus:ring-[var(--color-action-blue)]"
      />
      <span className="min-w-0 leading-5">{label}</span>
    </label>
  );
}

function OptionButton({ name, value, defaultChecked }: { name: string; value: string; defaultChecked?: boolean }) {
  return (
    <label className="cursor-pointer">
      <input className="peer sr-only" type="checkbox" name={name} value={value} defaultChecked={defaultChecked} />
      <span className="flex min-h-9 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-center text-xs font-medium text-[var(--color-text-secondary)] transition peer-checked:border-[var(--color-action-blue)] peer-checked:bg-[var(--color-header-surface)] peer-checked:text-[var(--color-action-blue)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-action-blue)] peer-focus-visible:ring-offset-2 hover:border-[var(--color-action-blue)]">
        {value}
      </span>
    </label>
  );
}

export function ShopFilters({ params, merchantIds, specFilters }: Props) {
  const selectedMerchants = asArray(params.merchant);
  const selectedStock = asArray(params.stock);
  const visibleMerchants = useMemo(() => merchantIds.slice(0, 10), [merchantIds]);
  const selectedCount = selectedMerchants.length + selectedStock.length + specFilters.reduce((count, filter) => count + asArray(params[`spec_${filter.fieldId}`]).length, 0);

  return (
    <form method="get" className="rounded-lg bg-[var(--color-header-surface)] p-3 sm:p-4" aria-label="Ապրանքների ֆիլտրեր">
      <input type="hidden" name="sort" value={(Array.isArray(params.sort) ? params.sort[0] : params.sort) || "newest"} />

      <div className="mb-3 flex items-start justify-between gap-3 px-0.5">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Ֆիլտրեր</h2>
          {selectedCount > 0 ? <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">Ընտրված է {selectedCount}</p> : null}
        </div>
        {selectedCount > 0 ? <span className="rounded-sm bg-[var(--color-border-muted)] px-2 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">{selectedCount}</span> : null}
      </div>

      <div className="space-y-3">
        <FilterCard title="Գնային միջակայք">
          <div className="grid grid-cols-2 gap-2">
            <label><span className="sr-only">Նվազագույն գին</span><input name="min" inputMode="numeric" defaultValue={Array.isArray(params.min) ? params.min[0] : params.min} placeholder="Նվազագույն" className={inputClassName} /></label>
            <label><span className="sr-only">Առավելագույն գին</span><input name="max" inputMode="numeric" defaultValue={Array.isArray(params.max) ? params.max[0] : params.max} placeholder="Առավելագույն" className={inputClassName} /></label>
          </div>
          <div className="relative mx-1 mt-3 h-1 rounded-full bg-[var(--color-border-muted)]" aria-hidden="true">
            <span className="absolute left-[12%] right-[34%] h-1 rounded-full bg-[var(--color-action-blue)]" />
            <span className="absolute -left-1.5 -top-1.5 h-4 w-4 rounded-full border-2 border-[var(--color-action-blue)] bg-white" />
            <span className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full border-2 border-[var(--color-action-blue)] bg-white" />
          </div>
        </FilterCard>

        <FilterCard title="Խանութներ" count={selectedMerchants.length}>
          <div>{visibleMerchants.map((id) => <CheckboxRow key={id} name="merchant" value={id} label={id.slice(0, 8)} defaultChecked={selectedMerchants.includes(id)} />)}</div>
          {merchantIds.length > visibleMerchants.length ? <p className="mt-2 text-xs font-semibold text-[var(--color-action-blue)]">+ ևս {merchantIds.length - visibleMerchants.length}</p> : null}
        </FilterCard>

        {specFilters.length === 0 ? <p className="px-1 text-xs text-[var(--color-text-secondary)]">Այս կատեգորիայի համար բնութագրերի ֆիլտրեր չկան։</p> : specFilters.map((filter) => {
          const selectedOptions = asArray(params[`spec_${filter.fieldId}`]);
          return <FilterCard key={filter.fieldId} title={filter.fieldName} count={selectedOptions.length}><div className="grid grid-cols-2 gap-2">{filter.options.map((option) => <OptionButton key={option} name={`spec_${filter.fieldId}`} value={option} defaultChecked={selectedOptions.includes(option)} />)}</div></FilterCard>;
        })}

        <FilterCard title="Առկայություն" count={selectedStock.length}>
          <CheckboxRow name="stock" value="in_stock" label="Առկա է" defaultChecked={selectedStock.includes("in_stock")} />
          <CheckboxRow name="stock" value="out_of_stock" label="Պահեստում չկա" defaultChecked={selectedStock.includes("out_of_stock")} />
        </FilterCard>
      </div>

      <button className="mt-3 w-full rounded-md bg-[var(--color-action-blue)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-action-blue-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-action-blue)] focus:ring-offset-2">Կիրառել ֆիլտրերը</button>
    </form>
  );
}
