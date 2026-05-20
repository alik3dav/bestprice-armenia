import Link from "next/link";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { TableRowActions } from "@/components/admin/table-row-actions";
import { requireAdmin } from "@/lib/auth/guards";

async function deleteMerchant(id: string) {
  "use server";
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("merchants").delete().eq("id", id);
  return error ? { ok: false, message: error.message } : { ok: true, message: "Deleted." };
}

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("merchants").select("id,name,slug,status,updated_at,profile_id").order("updated_at", { ascending: false });
  const profileIds = (data ?? []).map((m) => m.profile_id).filter(Boolean);
  const { data: profiles } = profileIds.length ? await supabase.from("profiles").select("id,full_name").in("id", profileIds) : { data: [] as { id: string; full_name: string | null }[] };
  const ownerById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return <div className="space-y-3"><div className="flex justify-end"><Link href="/admin/merchants/new" className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">Create merchant</Link></div><DataTableShell title="Merchants Management" headers={<tr><th className="p-2">Company</th><th className="p-2">Owner</th><th className="p-2">Status</th><th className="p-2">Updated</th><th className="p-2 text-right">Actions</th></tr>} columnCount={5} state={error ? "error" : (data?.length ?? 0) > 0 ? "ready" : "empty"} errorMessage={error?.message} total={data?.length ?? 0} rows={data?.map((m) => <tr key={m.id}><td className="p-2"><div className="font-medium">{m.name}</div><div className="text-xs text-slate-500">{m.slug}</div></td><td className="p-2">{(m.profile_id && ownerById.get(m.profile_id)) || "Unassigned"}</td><td className="p-2 capitalize">{m.status}</td><td className="p-2">{new Date(m.updated_at).toLocaleString()}</td><td className="p-2"><TableRowActions itemLabel="merchant" itemName={m.name} editHref={`/admin/merchants/${m.id}/edit`} detailsHref={`/admin/merchants/${m.id}`} onDelete={deleteMerchant.bind(null, m.id)} /></td></tr>)} /></div>;
}
