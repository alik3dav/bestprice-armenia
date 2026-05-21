"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import { SubmitButton } from "@/components/admin/submit-button";
import { createSlug } from "@/lib/slug";

export function CategoryForm({ action, backHref, submitLabel, submitLoadingLabel, defaultValues }: { action: (formData: FormData) => void; backHref: Route; submitLabel: string; submitLoadingLabel: string; defaultValues: { name: string; slug: string; status: "draft" | "active" | "archived"; imageUrl: string } }) {
  const [name, setName] = useState(defaultValues.name);
  const [slug, setSlug] = useState(defaultValues.slug);
  const [slugEdited, setSlugEdited] = useState(Boolean(defaultValues.slug));
  const [imageUrl, setImageUrl] = useState(defaultValues.imageUrl);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const generatedSlug = useMemo(() => createSlug(name, "-"), [name]);

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <label className="space-y-1"><span className="text-sm font-medium">Name *</span><input name="name" required value={name} onChange={(e) => { const nextName = e.target.value; setName(nextName); if (!slugEdited) setSlug(createSlug(nextName, "-")); }} className="w-full rounded border px-3 py-2 text-sm" placeholder="Smartphones" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Slug *</span><input name="slug" required value={slug} onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }} onFocus={() => setSlugEdited(true)} className="w-full rounded border px-3 py-2 text-sm" placeholder={generatedSlug || "smartphones"} /></label>
      <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Category image URL</span><input name="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" placeholder="https://..." /></label>
      <label className="space-y-1 md:col-span-2">
        <span className="text-sm font-medium">Upload category image</span>
        <input
          type="file"
          accept="image/*"
          className="w-full rounded border px-3 py-2 text-sm"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setIsUploadingImage(true);
            try {
              const { createClient } = await import("@/lib/supabase/client");
              const supabase = createClient();
              if (!supabase) {
                alert("Supabase client is not configured.");
                return;
              }

              const extension = file.name.split(".").pop()?.toLowerCase() || "png";
              const fileName = `${crypto.randomUUID()}.${extension}`;
              const bucket = process.env.NEXT_PUBLIC_SUPABASE_CATEGORY_IMAGES_BUCKET ?? "category-images";
              const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
              });

              if (uploadError) {
                alert(uploadError.message);
                return;
              }

              const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(fileName);
              if (!publicData?.publicUrl) {
                alert("Failed to resolve uploaded image URL.");
                return;
              }

              setImageUrl(publicData.publicUrl);
            } finally {
              setIsUploadingImage(false);
              event.target.value = "";
            }
          }}
        />
        <p className="text-xs text-slate-500">Upload to Supabase Storage and auto-fill the image URL field.</p>
        {isUploadingImage ? <p className="text-xs text-slate-500">Uploading image…</p> : null}
      </label>
      <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Status *</span><select name="status" required className="w-full rounded border px-3 py-2 text-sm" defaultValue={defaultValues.status}><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
      <div className="flex items-center justify-end gap-2 md:col-span-2"><Link href={backHref} className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Cancel</Link><SubmitButton label={submitLabel} loadingLabel={submitLoadingLabel} /></div>
    </form>
  );
}
