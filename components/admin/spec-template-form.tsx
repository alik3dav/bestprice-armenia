"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { SubmitButton } from "@/components/admin/submit-button";
import { createSlug } from "@/lib/slug";

type Category = { id: string; name: string; status: string };
type FieldType = "text" | "number" | "boolean" | "select" | "multi-select";

export type SpecTemplateFieldDraft = {
  id: string;
  persistedId?: string;
  groupId: string;
  name: string;
  key: string;
  fieldType: FieldType;
  required: boolean;
  sortOrder: number;
  optionsText: string;
};

export type SpecTemplateGroupDraft = { id: string; name: string; sortOrder: number };

const emptyGroup = (sortOrder: number): SpecTemplateGroupDraft => ({ id: crypto.randomUUID(), name: "", sortOrder });
const emptyField = (groupId: string, sortOrder: number): SpecTemplateFieldDraft => ({ id: crypto.randomUUID(), groupId, name: "", key: "", fieldType: "text", required: false, sortOrder, optionsText: "" });

export function SpecTemplateForm({ categories, action, backHref, submitLabel, submitLoadingLabel, defaultValues }: { categories: Category[]; action: (formData: FormData) => void; backHref: Route; submitLabel: string; submitLoadingLabel: string; defaultValues?: { name: string; categoryId: string; groups: SpecTemplateGroupDraft[]; fields: SpecTemplateFieldDraft[] } }) {
  const seedGroups = defaultValues?.groups?.length ? defaultValues.groups : [emptyGroup(0)];
  const [groups, setGroups] = useState<SpecTemplateGroupDraft[]>(seedGroups);
  const [fields, setFields] = useState<SpecTemplateFieldDraft[]>(defaultValues?.fields ?? []);
  const [clientError, setClientError] = useState<string | null>(null);
  const [fieldKeyEdited, setFieldKeyEdited] = useState<Record<string, boolean>>(() => Object.fromEntries((defaultValues?.fields ?? []).map((f) => [f.id, Boolean(f.key)])));

  const updateFieldName = (id: string, name: string) => {
    setFields((prev) => prev.map((f) => {
      if (f.id !== id) return f;
      if (fieldKeyEdited[id]) return { ...f, name };
      return { ...f, name, key: createSlug(name, "_") };
    }));
  };

  const updateFieldKey = (id: string, key: string) => {
    setFieldKeyEdited((prev) => ({ ...prev, [id]: true }));
    setFields((prev) => prev.map((f) => f.id === id ? { ...f, key } : f));
  };

  const payload = useMemo(() => JSON.stringify({
    groups: groups.map((g, i) => ({ id: g.id, name: g.name.trim(), sortOrder: i })),
    fields: fields.map((f, i) => ({ id: f.id, persistedId: f.persistedId ?? null, name: f.name.trim(), key: f.key.trim(), fieldType: f.fieldType, required: f.required, sortOrder: f.sortOrder ?? i, options: f.optionsText.split(/\r?\n|,/).map((o) => o.trim()).filter(Boolean), groupId: f.groupId }))
  }), [groups, fields]);

  const groupMap = new Map(groups.map((g) => [g.id, g]));

  return <form action={(formData) => {
    setClientError(null);
    const keys = new Set<string>();
    for (const g of groups) if (!g.name.trim()) return setClientError("Each group needs a name.");
    for (const f of fields) {
      if (!groupMap.has(f.groupId)) return setClientError("Each field must belong to a valid group.");
      const key = f.key.trim();
      if (!key) return setClientError("Each specification field must include a key/slug.");
      if (keys.has(key)) return setClientError(`Duplicate key found: ${key}. Keys must be unique inside one template.`);
      keys.add(key);
    }
    if (fields.length === 0) return setClientError("Add at least one specification field.");
    formData.set("specPayload", payload);
    action(formData);
  }} className="space-y-4">
    {clientError ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{clientError}</div> : null}

    <div className="grid gap-3 md:grid-cols-2">
      <label className="space-y-1"><span className="text-sm font-medium">Template Name *</span><input name="name" required defaultValue={defaultValues?.name ?? ""} className="w-full rounded border px-3 py-2 text-sm" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Category *</span><select name="categoryId" required className="w-full rounded border px-3 py-2 text-sm" defaultValue={defaultValues?.categoryId ?? ""}><option value="" disabled>Select category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.status})</option>)}</select></label>
    </div>

    <input type="hidden" name="specPayload" value={payload} />

    <div className="rounded border border-slate-200">
      <div className="flex items-center justify-between border-b px-3 py-2"><h2 className="text-sm font-semibold">Specification Fields</h2><button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => setGroups((prev) => [...prev, emptyGroup(prev.length)])}>Add group</button></div>
      <div className="space-y-2 p-2">
        {groups.map((group, gIndex) => {
          const gFields = fields.filter((f) => f.groupId === group.id).sort((a, b) => a.sortOrder - b.sortOrder);
          return <div key={group.id} className="rounded border border-slate-200">
            <div className="flex flex-wrap items-center gap-2 border-b bg-slate-50 px-2 py-1.5">
              <span className="text-xs font-semibold text-slate-600">Group {gIndex + 1}</span>
              <input value={group.name} onChange={(e) => setGroups((prev) => prev.map((g) => g.id === group.id ? { ...g, name: e.target.value } : g))} className="min-w-[180px] flex-1 rounded border px-2 py-1 text-sm" placeholder="Display" />
              <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => { const nextField = emptyField(group.id, gFields.length); setFields((prev) => [...prev, nextField]); setFieldKeyEdited((prev) => ({ ...prev, [nextField.id]: false })); }}>Add field</button>
              <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => { setGroups((prev) => prev.filter((g) => g.id !== group.id)); setFields((prev) => prev.filter((f) => f.groupId !== group.id)); }}>Remove</button>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-xs"><thead><tr className="border-b bg-slate-50 text-left"><th className="px-2 py-1">Group</th><th className="px-2 py-1">Label/Name</th><th className="px-2 py-1">Key/Slug</th><th className="px-2 py-1">Type</th><th className="px-2 py-1">Required</th><th className="px-2 py-1">Display Order</th><th className="px-2 py-1">Options</th><th className="px-2 py-1">Actions</th></tr></thead><tbody>
                {gFields.map((field) => <tr key={field.id} className="border-b last:border-b-0 align-top"><td className="px-2 py-1.5">{group.name || "—"}</td><td className="px-2 py-1.5"><input required value={field.name} onChange={(e) => updateFieldName(field.id, e.target.value)} className="w-36 rounded border px-2 py-1" /></td><td className="px-2 py-1.5"><input required value={field.key} onChange={(e) => updateFieldKey(field.id, e.target.value)} className="w-36 rounded border px-2 py-1" /></td><td className="px-2 py-1.5"><select value={field.fieldType} onChange={(e) => setFields((p) => p.map((f) => f.id === field.id ? { ...f, fieldType: e.target.value as FieldType } : f))} className="rounded border px-2 py-1"><option value="text">Text</option><option value="number">Number</option><option value="boolean">Boolean</option><option value="select">Select</option><option value="multi-select">Multi-select</option></select></td><td className="px-2 py-1.5"><input type="checkbox" checked={field.required} onChange={(e) => setFields((p) => p.map((f) => f.id === field.id ? { ...f, required: e.target.checked } : f))} /></td><td className="px-2 py-1.5"><input type="number" value={field.sortOrder} onChange={(e) => setFields((p) => p.map((f) => f.id === field.id ? { ...f, sortOrder: Number(e.target.value) } : f))} className="w-16 rounded border px-2 py-1" /></td><td className="px-2 py-1.5">{field.fieldType === "select" || field.fieldType === "multi-select" ? <input value={field.optionsText} onChange={(e) => setFields((p) => p.map((f) => f.id === field.id ? { ...f, optionsText: e.target.value } : f))} className="w-40 rounded border px-2 py-1" placeholder="A,B,C" /> : <span className="text-slate-400">—</span>}</td><td className="px-2 py-1.5"><button type="button" className="rounded border px-2 py-1" onClick={() => { if (field.persistedId && !confirm("This will remove this spec value from products in this category only for this field.")) return; setFields((p) => p.filter((f) => f.id !== field.id)); }}>Remove</button></td></tr>)}
              </tbody></table>
            </div>

            <div className="space-y-2 p-2 md:hidden">{gFields.map((field) => <div key={field.id} className="rounded border p-2 text-xs"><div className="grid grid-cols-2 gap-2"><input value={field.name} onChange={(e) => updateFieldName(field.id, e.target.value)} className="rounded border px-2 py-1" placeholder="Label" /><input value={field.key} onChange={(e) => updateFieldKey(field.id, e.target.value)} className="rounded border px-2 py-1" placeholder="key_slug" /><select value={field.fieldType} onChange={(e) => setFields((p) => p.map((f) => f.id === field.id ? { ...f, fieldType: e.target.value as FieldType } : f))} className="rounded border px-2 py-1"><option value="text">Text</option><option value="number">Number</option><option value="boolean">Boolean</option><option value="select">Select</option><option value="multi-select">Multi</option></select><input type="number" value={field.sortOrder} onChange={(e) => setFields((p) => p.map((f) => f.id === field.id ? { ...f, sortOrder: Number(e.target.value) } : f))} className="rounded border px-2 py-1" placeholder="Order" /></div><div className="mt-2 flex items-center justify-between"><label className="flex items-center gap-1"><input type="checkbox" checked={field.required} onChange={(e) => setFields((p) => p.map((f) => f.id === field.id ? { ...f, required: e.target.checked } : f))} />Required</label><button type="button" className="rounded border px-2 py-1" onClick={() => setFields((p) => p.filter((f) => f.id !== field.id))}>Remove</button></div></div>)}</div>
          </div>;
        })}
      </div>
    </div>

    <div className="flex items-center justify-end gap-2"><Link href={backHref} className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Cancel</Link><SubmitButton label={submitLabel} loadingLabel={submitLoadingLabel} disabled={categories.length === 0} /></div>
  </form>;
}
