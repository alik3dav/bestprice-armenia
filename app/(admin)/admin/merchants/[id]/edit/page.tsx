import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { MerchantForm } from "@/components/admin/merchant-form";
import { requireAdmin } from "@/lib/auth/guards";

const updateMerchantSchema = z.object({
  companyName: z.string().trim().min(2),
  slug: z.string().trim().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  status: z.enum(["draft", "active", "archived"]),
  logoPath: z.string().trim().optional(),
});

export default async function EditMerchantPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: merchant, error } = await supabase.from("merchants").select("id,name,slug,status,logo_path").eq("id", id).single();
  if (error || !merchant) notFound();

  async function updateMerchant(formData: FormData) {
    "use server";
    const { supabase: admin } = await requireAdmin();
    const parsed = updateMerchantSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) redirect(`/admin/merchants/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid form data")}`);

    const { error: updateError } = await admin.from("merchants").update({
      name: parsed.data.companyName,
      slug: parsed.data.slug,
      status: parsed.data.status,
      logo_path: parsed.data.logoPath?.trim() || null,
    }).eq("id", id);

    if (updateError) redirect(`/admin/merchants/${id}/edit?error=${encodeURIComponent(updateError.message)}`);
    redirect("/admin/merchants");
  }

  return <section className="space-y-4 rounded border bg-white p-4"><div className="flex items-center justify-between gap-3"><div><h1 className="text-xl font-semibold">Edit Merchant</h1><p className="text-sm text-slate-500">Update merchant details and logo.</p></div><Link href="/admin/merchants" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Back to merchants</Link></div>{query?.error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{query.error}</div> : null}<MerchantForm action={updateMerchant} backHref="/admin/merchants" submitLabel="Save merchant" submitLoadingLabel="Saving..." defaultValues={{ id: merchant.id, companyName: merchant.name, slug: merchant.slug, status: merchant.status, logoPath: merchant.logo_path ?? "" }} /></section>;
}
