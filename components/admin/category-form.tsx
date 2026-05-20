import Link from "next/link";
import type { Route } from "next";
import { SubmitButton } from "@/components/admin/submit-button";

export function CategoryForm({ action, backHref, submitLabel, submitLoadingLabel, defaultValues }: { action: (formData: FormData) => void; backHref: Route; submitLabel: string; submitLoadingLabel: string; defaultValues: { name: string; slug: string; status: "draft" | "active" | "archived" } }) {
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <label className="space-y-1"><span className="text-sm font-medium">Name *</span><input name="name" required defaultValue={defaultValues.name} className="w-full rounded border px-3 py-2 text-sm" placeholder="Smartphones" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Slug *</span><input name="slug" required defaultValue={defaultValues.slug} className="w-full rounded border px-3 py-2 text-sm" placeholder="smartphones" /></label>
      <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Status *</span><select name="status" required className="w-full rounded border px-3 py-2 text-sm" defaultValue={defaultValues.status}><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
      <div className="flex items-center justify-end gap-2 md:col-span-2"><Link href={backHref} className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Cancel</Link><SubmitButton label={submitLabel} loadingLabel={submitLoadingLabel} /></div>
    </form>
  );
}
