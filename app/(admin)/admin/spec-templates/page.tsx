import Link from "next/link";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { TableRowActions } from "@/components/admin/table-row-actions";
import { requireAdmin } from "@/lib/auth/guards";

async function deleteSpecTemplate(id: string) {
  "use server";
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("specification_groups").delete().eq("id", id);
  return error ? { ok: false, message: error.message } : { ok: true, message: "Deleted." };
}

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("specification_groups")
    .select("id,name,created_at,categories(name)")
    .order("created_at", { ascending: false });

  if (error && process.env.NODE_ENV === "development") {
    console.error("[admin/spec-templates] Failed to load specification groups", error);
  }

  return (
    <DataTableShell
      title="Spec-templates Management"
      headers={<tr><th className="p-2">Name</th><th className="p-2">Status</th><th className="p-2">Updated</th><th className="p-2 text-right">Actions</th></tr>}
      columnCount={4}
      state={error ? "error" : (data?.length ?? 0) > 0 ? "ready" : "empty"}
      errorMessage={error?.message}
      total={data?.length ?? 0}
      rows={
        data?.map((group) => (
          <tr key={group.id}>
            <td className="p-2">{group.name}</td>
            <td className="p-2">{group.categories?.[0]?.name ? `Category: ${group.categories[0].name}` : "—"}</td>
            <td className="p-2">{new Date(group.created_at).toLocaleString()}</td>
            <td className="p-2"><TableRowActions itemLabel="spec template" itemName={group.name} detailsHref={`/admin/spec-templates/${group.id}`} editHref={`/admin/spec-templates/${group.id}/edit`} onDelete={deleteSpecTemplate.bind(null, group.id)} /></td>
          </tr>
        ))
      }
    >
      <div className="flex justify-end">
        <Link href="/admin/spec-templates/new" className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Create Spec Template
        </Link>
      </div>
    </DataTableShell>
  );
}
