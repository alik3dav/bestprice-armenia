import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { MerchantForm } from "@/components/admin/merchant-form";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

const createMerchantSchema = z.object({
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and use hyphens only."),
  contactName: z.string().trim().min(2, "Contact person name must be at least 2 characters."),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  status: z.enum(["draft", "active", "archived"])
});

export default async function NewMerchantPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  await requireAdmin();
  const params = await searchParams;

  async function createMerchant(formData: FormData) {
    "use server";
    await requireAdmin();

    const parsed = createMerchantSchema.safeParse({
      businessName: formData.get("businessName"),
      slug: formData.get("slug"),
      contactName: formData.get("contactName"),
      email: formData.get("email"),
      password: formData.get("password"),
      status: formData.get("status")
    });

    if (!parsed.success) {
      redirect(`/admin/merchants/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Please review the form and try again.")}`);
    }

    const adminClient = createAdminClient();

    const { data: authResult, error: authError } = await adminClient.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        full_name: parsed.data.contactName,
        role: "merchant"
      }
    });

    if (authError || !authResult.user) {
      const message = authError?.message?.toLowerCase().includes("already")
        ? "A user with this email already exists."
        : authError?.message ?? "Failed to create auth user.";
      redirect(`/admin/merchants/new?error=${encodeURIComponent(message)}`);
    }

    const profileId = authResult.user.id;

    const { error: profileError } = await adminClient.from("profiles").upsert({
      id: profileId,
      role: "merchant",
      full_name: parsed.data.contactName
    });

    if (profileError) {
      await adminClient.auth.admin.deleteUser(profileId);
      redirect(`/admin/merchants/new?error=${encodeURIComponent(profileError.message)}`);
    }

    const { error: merchantError } = await adminClient.from("merchants").insert({
      profile_id: profileId,
      name: parsed.data.businessName,
      slug: parsed.data.slug,
      status: parsed.data.status
    });

    if (merchantError) {
      await adminClient.from("profiles").delete().eq("id", profileId);
      await adminClient.auth.admin.deleteUser(profileId);
      const message = merchantError.message.toLowerCase().includes("duplicate key")
        ? "Merchant slug already exists."
        : merchantError.message;
      redirect(`/admin/merchants/new?error=${encodeURIComponent(message)}`);
    }

    redirect("/admin/merchants");
  }

  return (
    <section className="space-y-4 rounded border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Create Merchant</h1>
          <p className="text-sm text-slate-500">Create a merchant user profile and business account.</p>
        </div>
        <Link href="/admin/merchants" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">
          Back to merchants
        </Link>
      </div>

      {params?.error ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{params.error}</div>
      ) : null}

      <MerchantForm
        action={createMerchant}
        backHref="/admin/merchants"
        submitLabel="Create merchant"
        submitLoadingLabel="Creating..."
        defaultValues={{ businessName: "", slug: "", contactName: "", email: "", password: "", status: "draft" }}
      />
    </section>
  );
}
