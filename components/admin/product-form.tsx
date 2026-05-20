"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { SubmitButton } from "@/components/admin/submit-button";
import { createSlug } from "@/lib/slug";

type Category = { id: string; name: string; status: string };
type Brand = { id: string; name: string };
type SpecFieldType = "text" | "number" | "boolean" | "select" | "multi-select";
type TemplateField = { id: string; name: string; key: string; fieldType: SpecFieldType; required: boolean; sortOrder: number; options: string[] };
type TemplateGroup = { id: string; name: string; sortOrder: number; fields: TemplateField[] };
type CategoryTemplate = { templateId: string; templateName: string; groups: TemplateGroup[] };

type ProductFormValues = {
  title: string; slug: string; categoryId: string; brandId: string; model: string; description: string;
  status: "draft" | "active" | "archived"; images: string; specValues?: Record<string, string | string[]>;
};

export function ProductForm({ action, categories, brands, templatesByCategory, backHref, submitLabel, submitLoadingLabel, defaultValues, disableSubmit }: {
  action: (formData: FormData) => void; categories: Category[]; brands: Brand[]; templatesByCategory: Record<string, CategoryTemplate>;
  backHref: Route; submitLabel: string; submitLoadingLabel: string; defaultValues: ProductFormValues; disableSubmit?: boolean;
}) {
  const [categoryId, setCategoryId] = useState(defaultValues.categoryId);
  const [values, setValues] = useState<Record<string, string | string[]>>(defaultValues.specValues ?? {});
  const [specError, setSpecError] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);
  const [title, setTitle] = useState(defaultValues.title);
  const [slug, setSlug] = useState(defaultValues.slug);
  const [slugEdited, setSlugEdited] = useState(Boolean(defaultValues.slug));

  const template = templatesByCategory[categoryId];
  const fields = useMemo(() => template?.groups.flatMap((g) => g.fields) ?? [], [template]);

  useEffect(() => {
    if (!template) { setValues({}); return; }
    setValues((prev) => {
      const next: Record<string, string | string[]> = {};
      for (const f of fields) {
        const old = prev[f.key] ?? defaultValues.specValues?.[f.key];
        if (old !== undefined) next[f.key] = old;
      }
      return next;
    });
  }, [categoryId]);

  const renderInput = (field: TemplateField) => {
    const value = values[field.key];
    if (field.fieldType === "boolean") {
      return <select value={(value as string) ?? ""} onChange={(e) => { setChanged(true); setValues((p) => ({ ...p, [field.key]: e.target.value })); }} className="w-full rounded border px-2 py-1 text-xs"><option value="">—</option><option value="true">True</option><option value="false">False</option></select>;
    }
    if (field.fieldType === "select") {
      return <select value={(value as string) ?? ""} onChange={(e) => { setChanged(true); setValues((p) => ({ ...p, [field.key]: e.target.value })); }} className="w-full rounded border px-2 py-1 text-xs"><option value="">Select</option>{field.options.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
    }
    if (field.fieldType === "multi-select") {
      const selected = Array.isArray(value) ? value : [];
      return <select multiple value={selected} onChange={(e) => { setChanged(true); setValues((p) => ({ ...p, [field.key]: Array.from(e.target.selectedOptions).map((o) => o.value) })); }} className="w-full rounded border px-2 py-1 text-xs min-h-20">{field.options.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
    }
    return <input type={field.fieldType === "number" ? "number" : "text"} value={(value as string) ?? ""} onChange={(e) => { setChanged(true); setValues((p) => ({ ...p, [field.key]: e.target.value })); }} className="w-full rounded border px-2 py-1 text-xs" />;
  };

  return (
    <form action={(formData) => {
      setSpecError(null);
      if (template) {
        for (const f of fields) {
          const v = values[f.key];
          const empty = Array.isArray(v) ? v.length === 0 : !String(v ?? "").trim();
          if (f.required && empty) { setSpecError(`${f.name} is required.`); return; }
        }
      }
      formData.set("specValues", JSON.stringify(values));
      formData.set("specTemplateId", template?.templateId ?? "");
      action(formData);
    }} className="grid gap-4 md:grid-cols-2">
      <label className="space-y-1"><span className="text-sm font-medium">Title *</span><input name="title" required value={title} onChange={(e) => { const nextTitle = e.target.value; setTitle(nextTitle); if (!slugEdited) setSlug(createSlug(nextTitle, "-")); }} className="w-full rounded border px-3 py-2 text-sm" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Slug *</span><input name="slug" required value={slug} onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }} onFocus={() => setSlugEdited(true)} className="w-full rounded border px-3 py-2 text-sm" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Category *</span><select name="categoryId" required className="w-full rounded border px-3 py-2 text-sm" value={categoryId} onChange={(e) => { if (changed && !confirm("Changing category will reload specification fields and may remove unmatched values. Continue?")) return; setCategoryId(e.target.value); setChanged(false); }}><option value="" disabled>Select category</option>{categories.map((category) => (<option key={category.id} value={category.id}>{category.name} ({category.status})</option>))}</select></label>
      <label className="space-y-1"><span className="text-sm font-medium">Brand</span><select name="brandId" className="w-full rounded border px-3 py-2 text-sm" defaultValue={defaultValues.brandId}><option value="">No brand</option>{brands.map((brand) => (<option key={brand.id} value={brand.id}>{brand.name}</option>))}</select></label>
      <label className="space-y-1"><span className="text-sm font-medium">Model</span><input name="model" defaultValue={defaultValues.model} className="w-full rounded border px-3 py-2 text-sm" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Status *</span><select name="status" required className="w-full rounded border px-3 py-2 text-sm" defaultValue={defaultValues.status}><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></label>

      <div className="md:col-span-2 rounded border border-slate-200">
        <div className="border-b bg-slate-50 px-3 py-2 text-sm font-semibold">Specifications</div>
        {!categoryId ? <div className="p-3 text-sm text-slate-500">Select a category to load specification fields.</div> : !template ? <div className="p-3 text-sm text-amber-700">No specification template linked to this category.</div> : template.groups.length === 0 ? <div className="p-3 text-sm text-slate-500">Template is empty.</div> : <div className="space-y-2 p-2">{template.groups.sort((a,b)=>a.sortOrder-b.sortOrder).map((g)=><div key={g.id} className="rounded border"><div className="border-b bg-slate-50 px-2 py-1 text-xs font-semibold">{g.name}</div><table className="w-full text-xs"><tbody>{g.fields.sort((a,b)=>a.sortOrder-b.sortOrder).map((f)=><tr key={f.id} className="border-b last:border-0"><td className="w-1/3 px-2 py-1.5 font-medium">{f.name}{f.required?" *":""}</td><td className="px-2 py-1.5">{renderInput(f)}</td></tr>)}</tbody></table></div>)}</div>}
      </div>
      {specError ? <div className="md:col-span-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">{specError}</div> : null}

      <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Images</span><textarea name="images" defaultValue={defaultValues.images} rows={3} className="w-full rounded border px-3 py-2 text-sm" /></label>
      <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Description</span><textarea name="description" defaultValue={defaultValues.description} rows={5} className="w-full rounded border px-3 py-2 text-sm" /></label>
      <div className="flex items-center justify-end gap-2 md:col-span-2"><Link href={backHref} className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Cancel</Link><SubmitButton label={submitLabel} loadingLabel={submitLoadingLabel} disabled={disableSubmit} /></div>
    </form>
  );
}
