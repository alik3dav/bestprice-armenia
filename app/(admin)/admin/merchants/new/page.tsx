import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { MerchantForm } from "@/components/admin/merchant-form";
import { requireAdmin } from "@/lib/auth/guards";

const createMerchantSchema = z.object({
  companyName: z.string().trim().min(2),
  slug: z.string().trim().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  website: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  status: z.enum(["draft", "active", "archived"])
});

export default async function NewMerchantPage({ searchParams }: { searchParams?: Promise<{ error?: string; success?: string }> }) {
  await requireAdmin();
  const params = await searchParams;

  async function createMerchant(formData: FormData) {
    "use server";
    const { supabase } = await requireAdmin();
    const parsed = createMerchantSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) redirect(`/admin/merchants/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid form data")}`);

    const { error } = await supabase.from("merchants").insert({
      name: parsed.data.companyName,
      slug: parsed.data.slug,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      website: parsed.data.website || null,
      notes: parsed.data.notes || null,
      status: parsed.data.status
    });

    if (error) redirect(`/admin/merchants/new?error=${encodeURIComponent(error.message)}`);
    redirect("/admin/merchants");
  }

  return <section className="space-y-4 rounded border bg-white p-4"><div className="flex items-center justify-between gap-3"><div><h1 className="text-xl font-semibold">Create Merchant</h1><p className="text-sm text-slate-500">Create a merchant/company record only.</p></div><Link href="/admin/merchants" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Back to merchants</Link></div>{params?.error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{params.error}</div> : null}<MerchantForm action={createMerchant} backHref="/admin/merchants" submitLabel="Create merchant" submitLoadingLabel="Creating..." defaultValues={{ companyName: "", slug: "", email: "", phone: "", website: "", notes: "", status: "draft" }} /></section>;
}
