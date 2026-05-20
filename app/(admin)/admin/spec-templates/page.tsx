import Link from "next/link";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { requireAdmin } from "@/lib/auth/guards";

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
      state={error ? "error" : (data?.length ?? 0) > 0 ? "ready" : "empty"}
      errorMessage={error?.message}
      total={data?.length ?? 0}
      rows={
        data?.map((group) => (
          <tr key={group.id}>
            <td className="p-2">{group.name}</td>
            <td className="p-2">{group.categories?.[0]?.name ? `Category: ${group.categories[0].name}` : "—"}</td>
            <td className="p-2">{new Date(group.created_at).toLocaleString()}</td>
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
