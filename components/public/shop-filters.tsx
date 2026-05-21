"use client";

import { useMemo, useState } from "react";

type CategoryRow = { id: string; name: string };
type MerchantRow = { id: string; name: string };

type SearchParams = Record<string, string | string[] | undefined>;

type Props = {
  categories: CategoryRow[];
  merchants: MerchantRow[];
  params: SearchParams;
};

const DISPLAY_OPTIONS = ["OLED", "AMOLED", "IPS"];
const STORAGE_OPTIONS = ["128GB", "256GB", "512GB"];

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

export function ShopFilters({ categories, merchants, params }: Props) {
  const selectedCategories = asArray(params.category);
  const selectedBrands = asArray(params.brand);
  const selectedDisplay = asArray(params.display);
  const selectedStorage = asArray(params.storage);
  const selectedStock = asArray(params.stock);

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  const visibleCategories = useMemo(() => (showAllCategories ? categories : categories.slice(0, 8)), [categories, showAllCategories]);
  const visibleBrands = useMemo(() => (showAllBrands ? merchants : merchants.slice(0, 6)), [merchants, showAllBrands]);

  return (
    <form method="get" className="space-y-5">
      <input type="hidden" name="sort" value={(Array.isArray(params.sort) ? params.sort[0] : params.sort) || "newest"} />

      <FilterSection title="Category" count={selectedCategories.length}>
        <div>
          {visibleCategories.map((c) => (
            <CheckboxRow key={c.id} name="category" value={c.id} label={c.name} defaultChecked={selectedCategories.includes(c.id)} />
          ))}
        </div>
        {categories.length > 8 ? (
          <button type="button" onClick={() => setShowAllCategories((v) => !v)} className="text-xs text-slate-500 hover:text-slate-800">
            {showAllCategories ? "Show less" : "Show more"}
          </button>
        ) : null}
      </FilterSection>

      <FilterSection title="Brand" count={selectedBrands.length}>
        <div>
          {visibleBrands.map((m) => (
            <CheckboxRow key={m.id} name="brand" value={m.id} label={m.name} defaultChecked={selectedBrands.includes(m.id)} />
          ))}
        </div>
        {merchants.length > 6 ? (
          <button type="button" onClick={() => setShowAllBrands((v) => !v)} className="text-xs text-slate-500 hover:text-slate-800">
            {showAllBrands ? "Show less" : "Show more"}
          </button>
        ) : null}
      </FilterSection>

      <FilterSection title="Display" count={selectedDisplay.length}>
        {DISPLAY_OPTIONS.map((option) => (
          <CheckboxRow key={option} name="display" value={option.toLowerCase()} label={option} defaultChecked={selectedDisplay.includes(option.toLowerCase())} />
        ))}
      </FilterSection>

      <FilterSection title="Storage" count={selectedStorage.length}>
        {STORAGE_OPTIONS.map((option) => (
          <CheckboxRow key={option} name="storage" value={option.toLowerCase()} label={option} defaultChecked={selectedStorage.includes(option.toLowerCase())} />
        ))}
      </FilterSection>

      <FilterSection title="Price" count={0}>
        <div className="grid grid-cols-2 gap-2">
          <input name="min" defaultValue={Array.isArray(params.min) ? params.min[0] : params.min} placeholder="Min" className="h-9 w-full rounded-md border border-slate-200 px-2.5 text-sm" />
          <input name="max" defaultValue={Array.isArray(params.max) ? params.max[0] : params.max} placeholder="Max" className="h-9 w-full rounded-md border border-slate-200 px-2.5 text-sm" />
        </div>
      </FilterSection>

      <FilterSection title="Availability" count={selectedStock.length}>
        <CheckboxRow name="stock" value="in_stock" label="In Stock" defaultChecked={selectedStock.includes("in_stock")} />
        <CheckboxRow name="stock" value="out_of_stock" label="Out of Stock" defaultChecked={selectedStock.includes("out_of_stock")} />
      </FilterSection>

      <button className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black">Apply filters</button>
    </form>
  );
}
