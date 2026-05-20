"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import { SubmitButton } from "@/components/admin/submit-button";
import { createSlug } from "@/lib/slug";

type MerchantFormValues = {
  businessName: string;
  slug: string;
  contactName: string;
  email: string;
  password: string;
  status: "draft" | "active" | "archived";
};

export function MerchantForm({
  action,
  backHref,
  submitLabel,
  submitLoadingLabel,
  defaultValues
}: {
  action: (formData: FormData) => void;
  backHref: Route;
  submitLabel: string;
  submitLoadingLabel: string;
  defaultValues: MerchantFormValues;
}) {
  const [businessName, setBusinessName] = useState(defaultValues.businessName);
  const [slug, setSlug] = useState(defaultValues.slug);
  const [slugEdited, setSlugEdited] = useState(Boolean(defaultValues.slug));

  const generatedSlug = useMemo(() => createSlug(businessName, "-"), [businessName]);

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <label className="space-y-1">
        <span className="text-sm font-medium">Business / Company name *</span>
        <input
          name="businessName"
          required
          value={businessName}
          onChange={(e) => {
            const nextName = e.target.value;
            setBusinessName(nextName);
            if (!slugEdited) setSlug(createSlug(nextName, "-"));
          }}
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="ACME Electronics"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Slug *</span>
        <input
          name="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugEdited(true);
          }}
          onFocus={() => setSlugEdited(true)}
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder={generatedSlug || "acme-electronics"}
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Contact person name *</span>
        <input name="contactName" required defaultValue={defaultValues.contactName} className="w-full rounded border px-3 py-2 text-sm" />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Email *</span>
        <input name="email" type="email" required defaultValue={defaultValues.email} className="w-full rounded border px-3 py-2 text-sm" />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Temporary password *</span>
        <input name="password" type="password" required defaultValue={defaultValues.password} className="w-full rounded border px-3 py-2 text-sm" />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Status *</span>
        <select name="status" required className="w-full rounded border px-3 py-2 text-sm" defaultValue={defaultValues.status}>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </label>
      <div className="flex items-center justify-end gap-2 md:col-span-2">
        <Link href={backHref} className="rounded border px-3 py-2 text-sm hover:bg-slate-50">
          Cancel
        </Link>
        <SubmitButton label={submitLabel} loadingLabel={submitLoadingLabel} />
      </div>
    </form>
  );
}
