"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import { SubmitButton } from "@/components/admin/submit-button";
import { createSlug } from "@/lib/slug";

type MerchantFormValues = {
  companyName: string;
  slug: string;
  email: string;
  phone: string;
  website: string;
  notes: string;
  status: "draft" | "active" | "archived";
};

export function MerchantForm({ action, backHref, submitLabel, submitLoadingLabel, defaultValues }: {
  action: (formData: FormData) => void;
  backHref: Route;
  submitLabel: string;
  submitLoadingLabel: string;
  defaultValues: MerchantFormValues;
}) {
  const [companyName, setCompanyName] = useState(defaultValues.companyName);
  const [slug, setSlug] = useState(defaultValues.slug);
  const [slugEdited, setSlugEdited] = useState(Boolean(defaultValues.slug));
  const generatedSlug = useMemo(() => createSlug(companyName, "-"), [companyName]);

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <label className="space-y-1">
        <span className="text-sm font-medium">Company name *</span>
        <input name="companyName" required value={companyName} onChange={(e) => { const next = e.target.value; setCompanyName(next); if (!slugEdited) setSlug(createSlug(next, "-")); }} className="w-full rounded border px-3 py-2 text-sm" />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Slug *</span>
        <input name="slug" required value={slug} onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }} onFocus={() => setSlugEdited(true)} className="w-full rounded border px-3 py-2 text-sm" placeholder={generatedSlug || "acme-electronics"} />
      </label>
      <label className="space-y-1"><span className="text-sm font-medium">Contact email *</span><input name="email" type="email" required defaultValue={defaultValues.email} className="w-full rounded border px-3 py-2 text-sm" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Phone</span><input name="phone" defaultValue={defaultValues.phone} className="w-full rounded border px-3 py-2 text-sm" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Website</span><input name="website" defaultValue={defaultValues.website} className="w-full rounded border px-3 py-2 text-sm" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Status *</span><select name="status" required className="w-full rounded border px-3 py-2 text-sm" defaultValue={defaultValues.status}><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
      <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Notes</span><textarea name="notes" defaultValue={defaultValues.notes} rows={4} className="w-full rounded border px-3 py-2 text-sm" /></label>
      <div className="flex items-center justify-end gap-2 md:col-span-2">
        <Link href={backHref} className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Cancel</Link>
        <SubmitButton label={submitLabel} loadingLabel={submitLoadingLabel} />
      </div>
    </form>
  );
}
