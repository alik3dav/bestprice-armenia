"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import { SubmitButton } from "@/components/admin/submit-button";
import { createSlug } from "@/lib/slug";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";

type MerchantFormValues = {
  id?: string;
  companyName: string;
  slug: string;
  status: "draft" | "active" | "archived";
  logoPath: string;
};

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "M";
}

export function MerchantForm({ action, backHref, submitLabel, submitLoadingLabel, defaultValues }: {
  action: (formData: FormData) => void;
  backHref: Route;
  submitLabel: string;
  submitLoadingLabel: string;
  defaultValues: MerchantFormValues;
}) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [companyName, setCompanyName] = useState(defaultValues.companyName);
  const [slug, setSlug] = useState(defaultValues.slug);
  const [slugEdited, setSlugEdited] = useState(Boolean(defaultValues.slug));
  const [logoPath, setLogoPath] = useState(defaultValues.logoPath);
  const [logoUrl, setLogoUrl] = useState(() => {
    if (!defaultValues.logoPath) return "";
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_MERCHANT_LOGOS_BUCKET ?? "merchant-logos";
    return supabase.storage.from(bucket).getPublicUrl(defaultValues.logoPath).data.publicUrl;
  });
  const [uploadState, setUploadState] = useState<{ loading: boolean; progress: number; error: string | null; success: string | null }>({ loading: false, progress: 0, error: null, success: null });
  const generatedSlug = useMemo(() => createSlug(companyName, "-"), [companyName]);

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="logoPath" value={logoPath} />
      <label className="space-y-1">
        <span className="text-sm font-medium">Company name *</span>
        <input name="companyName" required value={companyName} onChange={(e) => { const next = e.target.value; setCompanyName(next); if (!slugEdited) setSlug(createSlug(next, "-")); }} className="w-full rounded border px-3 py-2 text-sm" />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium">Slug *</span>
        <input name="slug" required value={slug} onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }} onFocus={() => setSlugEdited(true)} className="w-full rounded border px-3 py-2 text-sm" placeholder={generatedSlug || "acme-electronics"} />
      </label>

      <div className="space-y-2 md:col-span-2">
        <span className="text-sm font-medium">Merchant logo</span>
        <div className="flex items-center gap-3 rounded border p-3">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded border bg-slate-50">
            {logoUrl ? <Image src={logoUrl} alt={`${companyName || "Merchant"} logo`} width={64} height={64} className="h-full w-full object-contain" unoptimized /> : <span className="text-xs font-semibold text-slate-500">{getInitials(companyName)}</span>}
          </div>
          <div className="flex-1 space-y-2">
            <input type="file" accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml" className="block text-xs" onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (!ALLOWED_IMAGE_TYPES.includes(file.type)) { setUploadState({ loading: false, progress: 0, error: "Invalid file type. Please upload PNG, JPG, WEBP, or SVG.", success: null }); return; }
              if (file.size > MAX_FILE_SIZE) { setUploadState({ loading: false, progress: 0, error: "File is too large. Maximum size is 2MB.", success: null }); return; }
              const bucket = process.env.NEXT_PUBLIC_SUPABASE_MERCHANT_LOGOS_BUCKET ?? "merchant-logos";
              const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
              const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
              const merchantIdSegment = defaultValues.id ?? "new";
              const nextPath = `${merchantIdSegment}/${Date.now()}-${safeName || `logo.${extension}`}`;
              setUploadState({ loading: true, progress: 15, error: null, success: null });
              const tick = setInterval(() => setUploadState((prev) => ({ ...prev, progress: Math.min(prev.progress + 10, 90) })), 180);
              const { error } = await supabase.storage.from(bucket).upload(nextPath, file, { upsert: true, contentType: file.type });
              clearInterval(tick);
              if (error) { setUploadState({ loading: false, progress: 0, error: error.message, success: null }); return; }
              if (logoPath && logoPath !== nextPath) await supabase.storage.from(bucket).remove([logoPath]);
              setLogoPath(nextPath);
              const { data } = supabase.storage.from(bucket).getPublicUrl(nextPath);
              setLogoUrl(data.publicUrl);
              setUploadState({ loading: false, progress: 100, error: null, success: "Logo uploaded successfully." });
              event.target.value = "";
            }} />
            <div className="flex items-center gap-2">
              <button type="button" disabled={!logoPath || uploadState.loading} onClick={async () => {
                if (!logoPath) return;
                const bucket = process.env.NEXT_PUBLIC_SUPABASE_MERCHANT_LOGOS_BUCKET ?? "merchant-logos";
                setUploadState({ loading: true, progress: 35, error: null, success: null });
                const { error } = await supabase.storage.from(bucket).remove([logoPath]);
                if (error) { setUploadState({ loading: false, progress: 0, error: error.message, success: null }); return; }
                setLogoPath("");
                setLogoUrl("");
                setUploadState({ loading: false, progress: 100, error: null, success: "Logo removed successfully." });
              }} className="rounded border px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-50">Remove logo</button>
            </div>
            {uploadState.loading ? <progress max={100} value={uploadState.progress} className="h-2 w-full" /> : null}
            {uploadState.error ? <p className="text-xs text-red-600">{uploadState.error}</p> : null}
            {uploadState.success ? <p className="text-xs text-emerald-600">{uploadState.success}</p> : null}
          </div>
        </div>
      </div>

      <label className="space-y-1"><span className="text-sm font-medium">Status *</span><select name="status" required className="w-full rounded border px-3 py-2 text-sm" defaultValue={defaultValues.status}><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
      <div className="flex items-center justify-end gap-2 md:col-span-2">
        <Link href={backHref} className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Cancel</Link>
        <SubmitButton label={submitLabel} loadingLabel={submitLoadingLabel} />
      </div>
    </form>
  );
}
