import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { UserForm } from "@/components/admin/user-form";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

const createUserSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "merchant", "user"]),
  merchantId: z.string().uuid().optional().or(z.literal("")),
  merchantAccess: z.enum(["owner", "manager"]).optional()
});

export default async function NewUserPage({ searchParams }: { searchParams?: Promise<{ error?: string; success?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: merchants } = await supabase.from("merchants").select("id,name,slug").order("name");

  async function createUser(formData: FormData) {
    "use server";
    await requireAdmin();
    const parsed = createUserSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) redirect(`/admin/users/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid form data")}`);
    if (parsed.data.role === "merchant" && !parsed.data.merchantId) redirect(`/admin/users/new?error=${encodeURIComponent("Please select a merchant for merchant role users.")}`);

    const admin = createAdminClient();
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({ email: parsed.data.email, password: parsed.data.password, email_confirm: true, user_metadata: { full_name: parsed.data.fullName, role: parsed.data.role } });
    if (authError || !authUser.user) {
      const message = authError?.message?.toLowerCase().includes("already")
        ? "A user with this email already exists."
        : authError?.message ?? "Failed to create auth user";
      redirect(`/admin/users/new?error=${encodeURIComponent(message)}`);
    }

    const uid = authUser.user.id;
    const { error: profileError } = await admin.from("profiles").upsert({ id: uid, role: parsed.data.role, full_name: parsed.data.fullName });
    if (profileError) {
      await admin.auth.admin.deleteUser(uid);
      redirect(`/admin/users/new?error=${encodeURIComponent(profileError.message)}`);
    }

    if (parsed.data.role === "merchant" && parsed.data.merchantId) {
      const { error: linkError } = await admin.from("merchants").update({ profile_id: uid }).eq("id", parsed.data.merchantId);
      if (linkError) {
        await admin.from("profiles").delete().eq("id", uid);
        await admin.auth.admin.deleteUser(uid);
        redirect(`/admin/users/new?error=${encodeURIComponent(linkError.message)}`);
      }
    }

    redirect("/admin/users");
  }

  return <section className="space-y-4 rounded border bg-white p-4"><div className="flex items-center justify-between gap-3"><div><h1 className="text-xl font-semibold">Create User</h1><p className="text-sm text-slate-500">Create an auth user and profile, then optionally link to a merchant.</p></div><Link href="/admin/users" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Back to users</Link></div>{params?.error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{params.error}</div> : null}<UserForm action={createUser} merchants={merchants ?? []} backHref="/admin/users" /></section>;
}
