import { DataTableShell } from "@/components/admin/data-table-shell";
import { TableRowActions } from "@/components/admin/table-row-actions";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

async function deleteUser(id: string) {
  "use server";
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  return error ? { ok: false, message: error.message } : { ok: true, message: "Deleted." };
}

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,role,created_at,merchants!profile_id(id,name,slug)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-3">
      <DataTableShell title="Users Management" headers={<tr><th className="p-2">User</th><th className="p-2">Role</th><th className="p-2">Merchant</th><th className="p-2">Created</th><th className="p-2 text-right">Actions</th></tr>} columnCount={5} state={error ? "error" : (data?.length ?? 0) > 0 ? "ready" : "empty"} errorMessage={error?.message} total={data?.length ?? 0} rows={data?.map((u) => <tr key={u.id}><td className="p-2"><div className="font-medium">{u.full_name ?? "—"}</div><div className="text-xs text-slate-500">{u.id}</div></td><td className="p-2 capitalize">{u.role}</td><td className="p-2">{Array.isArray(u.merchants) && u.merchants[0]?.name ? `${u.merchants[0].name} (${u.merchants[0].slug})` : "—"}</td><td className="p-2">{new Date(u.created_at).toLocaleString()}</td><td className="p-2"><TableRowActions itemLabel="user" itemName={u.full_name ?? u.id} editHref={`/admin/users/${u.id}/edit`} detailsHref={`/admin/users/${u.id}`} onDelete={deleteUser.bind(null, u.id)} /></td></tr>)} />
    </div>
  );
}
