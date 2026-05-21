"use client";

import { useMemo } from "react";

type SearchParams = Record<string, string | string[] | undefined>;

type Props = {
  params: SearchParams;
  merchantIds: string[];
  specFilters: { fieldId: string; fieldName: string; key: string; groupName: string; options: string[] }[];
};

const asArray = (value: string | string[] | undefined) => (Array.isArray(value) ? value : value ? [value] : []);

function FilterSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-800">{title}</h3>
        {count > 0 ? <span className="text-[11px] text-slate-500">({count})</span> : null}
      </div>
      {children}
    </section>
  );
}

function CheckboxRow({ name, value, label, defaultChecked }: { name: string; value: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 py-1.5 text-sm text-slate-600 transition hover:text-slate-900">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
      />
      <span className="leading-5">{label}</span>
    </label>
  );
}

export function ShopFilters({ params, merchantIds, specFilters }: Props) {
  const selectedՎաճառողs = asArray(params.merchant);
  const selectedStock = asArray(params.stock);
  const visibleՎաճառողs = useMemo(() => merchantIds.slice(0, 10), [merchantIds]);

  return (
    <form method="get" className="space-y-5">
      <input type="hidden" name="sort" value={(Array.isArray(params.sort) ? params.sort[0] : params.sort) || "newest"} />

      <FilterSection title="Վաճառող" count={selectedՎաճառողs.length}>
        <div>
          {visibleՎաճառողs.map((id) => (
            <CheckboxRow key={id} name="merchant" value={id} label={id.slice(0, 8)} defaultChecked={selectedՎաճառողs.includes(id)} />
          ))}
        </div>
      </FilterSection>

      {specFilters.length === 0 ? <p className="text-xs text-slate-500">Այս կատեգորիայի համար բնութագրերի ֆիլտրեր չկան։</p> : specFilters.map((f) => (
        <FilterSection key={f.fieldId} title={f.fieldName} count={asArray(params[`spec_${f.fieldId}`]).length}>
          {f.options.map((option) => <CheckboxRow key={option} name={`spec_${f.fieldId}`} value={option} label={option} defaultChecked={asArray(params[`spec_${f.fieldId}`]).includes(option)} />)}
        </FilterSection>
      ))}

      <FilterSection title="Գին" count={0}>
        <div className="grid grid-cols-2 gap-2">
          <input name="min" defaultValue={Array.isArray(params.min) ? params.min[0] : params.min} placeholder="Նվազագույն" className="h-9 w-full rounded-md border border-slate-200 px-2.5 text-sm" />
          <input name="max" defaultValue={Array.isArray(params.max) ? params.max[0] : params.max} placeholder="Առավելագույն" className="h-9 w-full rounded-md border border-slate-200 px-2.5 text-sm" />
        </div>
      </FilterSection>

      <FilterSection title="Առկայություն" count={selectedStock.length}>
        <CheckboxRow name="stock" value="in_stock" label="Առկա է" defaultChecked={selectedStock.includes("in_stock")} />
        <CheckboxRow name="stock" value="out_of_stock" label="Պահեստում չկա" defaultChecked={selectedStock.includes("out_of_stock")} />
      </FilterSection>

      <button className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black">Կիրառել ֆիլտրերը</button>
    </form>
  );
}
