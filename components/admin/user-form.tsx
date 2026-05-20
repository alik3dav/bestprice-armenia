"use client";

import Link from "next/link";
import type { Route } from "next";
import { SubmitButton } from "@/components/admin/submit-button";

type MerchantOption = { id: string; name: string; slug: string };

export function UserForm({ action, merchants, backHref }: { action: (formData: FormData) => void; merchants: MerchantOption[]; backHref: Route }) {
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <label className="space-y-1"><span className="text-sm font-medium">Full name *</span><input name="fullName" required className="w-full rounded border px-3 py-2 text-sm" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Email *</span><input name="email" type="email" required className="w-full rounded border px-3 py-2 text-sm" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Password *</span><input name="password" type="password" required minLength={8} className="w-full rounded border px-3 py-2 text-sm" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Role *</span><select name="role" required className="w-full rounded border px-3 py-2 text-sm"><option value="user">Customer</option><option value="merchant">Merchant</option><option value="admin">Admin</option></select></label>
      <label className="space-y-1"><span className="text-sm font-medium">Linked merchant (for merchant role)</span><select name="merchantId" className="w-full rounded border px-3 py-2 text-sm"><option value="">No merchant linked</option>{merchants.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.slug})</option>)}</select></label>
      <label className="space-y-1"><span className="text-sm font-medium">Merchant access level</span><select name="merchantAccess" className="w-full rounded border px-3 py-2 text-sm"><option value="owner">Owner</option><option value="manager">Manager</option></select></label>
      <div className="flex items-center justify-end gap-2 md:col-span-2">
        <Link href={backHref} className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Cancel</Link>
        <SubmitButton label="Create user" loadingLabel="Creating..." />
      </div>
    </form>
  );
}
