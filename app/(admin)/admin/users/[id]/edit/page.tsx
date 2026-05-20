import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { SubmitButton } from "@/components/admin/submit-button";
import { requireAdmin } from "@/lib/auth/guards";

const editUserSchema = z
  .object({
    fullName: z.string().trim().min(2),
    role: z.enum(["admin", "merchant", "user"]),
    merchantId: z.string().uuid().optional().or(z.literal("")),
    merchantAccess: z.enum(["owner", "manager", "staff", ""]).optional()
  })
  .superRefine((value, ctx) => {
    if (value.role === "merchant" && !value.merchantAccess) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["merchantAccess"],
        message: "Please select a merchant access level for merchant users."
      });
    }
  });

export default async function EditUserPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: profile }, { data: merchants }] = await Promise.all([
    supabase.from("profiles").select("id,full_name,role,merchant_access_level").eq("id", id).single(),
    supabase.from("merchants").select("id,name,slug,profile_id").order("name")
  ]);

  if (!profile) notFound();

  const linkedMerchantId = (merchants ?? []).find((m) => m.profile_id === id)?.id ?? "";

  async function updateUser(formData: FormData) {
    "use server";

    try {
      const { supabase: admin } = await requireAdmin();
      const parsed = editUserSchema.safeParse(Object.fromEntries(formData.entries()));
      if (!parsed.success) redirect(`/admin/users/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid form data")}`);

      const merchantAccessLevel = parsed.data.role === "merchant" ? parsed.data.merchantAccess : null;

      if (parsed.data.role === "merchant" && !parsed.data.merchantId) {
        redirect(`/admin/users/${id}/edit?error=${encodeURIComponent("Please select a merchant for merchant role users.")}`);
      }

      const { error: profileError } = await admin
        .from("profiles")
        .update({
          full_name: parsed.data.fullName,
          role: parsed.data.role,
          merchant_access_level: merchantAccessLevel || null
        })
        .eq("id", id);

      if (profileError) redirect(`/admin/users/${id}/edit?error=${encodeURIComponent(profileError.message)}`);

      if (parsed.data.role === "merchant" && parsed.data.merchantId) {
        const { data: existing } = await admin.from("merchants").select("id,profile_id").eq("id", parsed.data.merchantId).maybeSingle();
        if (!existing) redirect(`/admin/users/${id}/edit?error=${encodeURIComponent("Selected merchant does not exist.")}`);
        if (existing.profile_id && existing.profile_id !== id) {
          redirect(`/admin/users/${id}/edit?error=${encodeURIComponent("This merchant already has a linked user account.")}`);
        }

        const { error: clearError } = await admin.from("merchants").update({ profile_id: null }).eq("profile_id", id).neq("id", parsed.data.merchantId);
        if (clearError) redirect(`/admin/users/${id}/edit?error=${encodeURIComponent(clearError.message)}`);

        const { error: linkError } = await admin.from("merchants").update({ profile_id: id }).eq("id", parsed.data.merchantId);
        if (linkError) redirect(`/admin/users/${id}/edit?error=${encodeURIComponent(linkError.message)}`);
      } else {
        const { error: unlinkError } = await admin.from("merchants").update({ profile_id: null }).eq("profile_id", id);
        if (unlinkError) redirect(`/admin/users/${id}/edit?error=${encodeURIComponent(unlinkError.message)}`);
      }

      redirect("/admin/users?success=User+updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update user.";
      redirect(`/admin/users/${id}/edit?error=${encodeURIComponent(message)}`);
    }
  }

  return (
    <section className="space-y-4 rounded border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Edit User</h1>
          <p className="text-sm text-slate-500">Update profile role and merchant relation. Auth email/password cannot be edited here.</p>
        </div>
        <Link href="/admin/users" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Back to users</Link>
      </div>
      {search?.error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{search.error}</div> : null}
      {search?.success ? <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{search.success}</div> : null}

      <form action={updateUser} className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1"><span className="text-sm font-medium">Full name *</span><input name="fullName" required defaultValue={profile.full_name ?? ""} className="w-full rounded border px-3 py-2 text-sm" /></label>
        <label className="space-y-1"><span className="text-sm font-medium">Role *</span><select name="role" required defaultValue={profile.role} className="w-full rounded border px-3 py-2 text-sm"><option value="user">Customer</option><option value="merchant">Merchant</option><option value="admin">Admin</option></select></label>
        <label className="space-y-1"><span className="text-sm font-medium">Linked merchant (for merchant role)</span><select name="merchantId" defaultValue={linkedMerchantId} className="w-full rounded border px-3 py-2 text-sm"><option value="">No merchant linked</option>{(merchants ?? []).map((m) => <option key={m.id} value={m.id}>{m.name} ({m.slug})</option>)}</select></label>
        <label className="space-y-1"><span className="text-sm font-medium">Merchant access level</span><select name="merchantAccess" defaultValue={profile.merchant_access_level ?? ""} className="w-full rounded border px-3 py-2 text-sm"><option value="">No merchant access</option><option value="owner">Owner</option><option value="manager">Manager</option><option value="staff">Staff</option></select></label>
        <div className="flex items-center justify-end gap-2 md:col-span-2">
          <Link href="/admin/users" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Cancel</Link>
          <SubmitButton label="Save changes" loadingLabel="Saving..." />
        </div>
      </form>
    </section>
  );
}
