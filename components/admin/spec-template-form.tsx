"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { SubmitButton } from "@/components/admin/submit-button";

type Category = { id: string; name: string; status: string };

type FieldType = "text" | "number" | "boolean" | "select" | "multi-select";

export type SpecTemplateFieldDraft = {
  id: string;
  name: string;
  key: string;
  fieldType: FieldType;
  required: boolean;
  sortOrder: number;
  optionsText: string;
};

const emptyField = (): SpecTemplateFieldDraft => ({
  id: crypto.randomUUID(),
  name: "",
  key: "",
  fieldType: "text",
  required: false,
  sortOrder: 0,
  optionsText: ""
});

export function SpecTemplateForm({ categories, action, backHref, submitLabel, submitLoadingLabel, defaultValues }: { categories: Category[]; action: (formData: FormData) => void; backHref: Route; submitLabel: string; submitLoadingLabel: string; defaultValues?: { name: string; categoryId: string; fields: SpecTemplateFieldDraft[] } }) {
  const [fields, setFields] = useState<SpecTemplateFieldDraft[]>(defaultValues?.fields?.length ? defaultValues.fields : [emptyField()]);
  const [clientError, setClientError] = useState<string | null>(null);

  const fieldsPayload = useMemo(
    () =>
      JSON.stringify(
        fields.map((field) => ({
          name: field.name.trim(),
          key: field.key.trim(),
          fieldType: field.fieldType,
          required: field.required,
          sortOrder: field.sortOrder,
          options: field.optionsText
            .split(/\r?\n|,/) 
            .map((option) => option.trim())
            .filter(Boolean)
        }))
      ),
    [fields]
  );

  const updateField = <K extends keyof SpecTemplateFieldDraft>(id: string, key: K, value: SpecTemplateFieldDraft[K]) => {
    setFields((current) => current.map((field) => (field.id === id ? { ...field, [key]: value } : field)));
  };

  return (
    <form
      action={(formData) => {
        setClientError(null);

        const keys = new Set<string>();
        for (const field of fields) {
          const key = field.key.trim();
          if (!key) {
            setClientError("Each specification field must include a key/slug.");
            return;
          }
          if (keys.has(key)) {
            setClientError(`Duplicate key found: ${key}. Keys must be unique inside one template.`);
            return;
          }
          keys.add(key);
        }

        formData.set("fields", fieldsPayload);
        action(formData);
      }}
      className="space-y-4"
    >
      {clientError ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{clientError}</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium">Template Name *</span>
          <input name="name" required defaultValue={defaultValues?.name ?? ""} className="w-full rounded border px-3 py-2 text-sm" placeholder="Phone Specs" />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Category *</span>
          <select name="categoryId" required className="w-full rounded border px-3 py-2 text-sm" defaultValue={defaultValues?.categoryId ?? ""}>
            <option value="" disabled>Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name} ({category.status})</option>
            ))}
          </select>
        </label>
      </div>

      <input type="hidden" name="fields" value={fieldsPayload} />

      <div className="space-y-3 rounded border p-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Specification Fields</h2>
          <button type="button" onClick={() => setFields((prev) => [...prev, { ...emptyField(), sortOrder: prev.length }])} className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Add field</button>
        </div>

        {fields.length === 0 ? <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">No fields added yet. Add at least one specification field.</div> : null}

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-3 rounded border p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Field #{index + 1}</h3>
                <button type="button" className="rounded border px-2 py-1 text-xs hover:bg-slate-50" onClick={() => setFields((prev) => prev.filter((item) => item.id !== field.id))}>Remove</button>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <label className="space-y-1"><span className="text-sm font-medium">Label/Name *</span><input required value={field.name} onChange={(event) => updateField(field.id, "name", event.target.value)} className="w-full rounded border px-3 py-2 text-sm" /></label>
                <label className="space-y-1"><span className="text-sm font-medium">Key/Slug *</span><input required value={field.key} onChange={(event) => updateField(field.id, "key", event.target.value)} className="w-full rounded border px-3 py-2 text-sm" placeholder="battery_capacity"/></label>
                <label className="space-y-1"><span className="text-sm font-medium">Type *</span><select value={field.fieldType} onChange={(event) => updateField(field.id, "fieldType", event.target.value as FieldType)} className="w-full rounded border px-3 py-2 text-sm"><option value="text">Text</option><option value="number">Number</option><option value="boolean">Boolean</option><option value="select">Select</option><option value="multi-select">Multi-select</option></select></label>
                <label className="space-y-1"><span className="text-sm font-medium">Display Order *</span><input type="number" value={field.sortOrder} onChange={(event) => updateField(field.id, "sortOrder", Number(event.target.value))} className="w-full rounded border px-3 py-2 text-sm" /></label>
                <label className="flex items-center gap-2 pt-7"><input type="checkbox" checked={field.required} onChange={(event) => updateField(field.id, "required", event.target.checked)} className="h-4 w-4 rounded border" /><span className="text-sm font-medium">Required field</span></label>
              </div>
              {field.fieldType === "select" || field.fieldType === "multi-select" ? (
                <label className="space-y-1 block"><span className="text-sm font-medium">Options (comma or new line separated) *</span><textarea rows={3} value={field.optionsText} onChange={(event) => updateField(field.id, "optionsText", event.target.value)} className="w-full rounded border px-3 py-2 text-sm" placeholder="Black, White, Blue"/></label>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Link href={backHref} className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Cancel</Link>
        <SubmitButton label={submitLabel} loadingLabel={submitLoadingLabel} disabled={categories.length === 0} />
      </div>
    </form>
  );
}
