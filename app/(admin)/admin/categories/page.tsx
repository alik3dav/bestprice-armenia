import Link from "next/link";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { requireAdmin } from "@/lib/auth/guards";

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,status,updated_at")
    .order("updated_at", { ascending: false });

  if (error && process.env.NODE_ENV === "development") {
    console.error("[admin/categories] Failed to load categories", error);
  }

  return (
    <DataTableShell
      title="Categories Management"
      state={error ? "error" : (data?.length ?? 0) > 0 ? "ready" : "empty"}
      errorMessage={error?.message}
      total={data?.length ?? 0}
      rows={
        data?.map((category) => (
          <tr key={category.id}>
            <td className="p-2">{category.name}</td>
            <td className="p-2 capitalize">{category.status}</td>
            <td className="p-2">{new Date(category.updated_at).toLocaleString()}</td>
          </tr>
        ))
      }
    >
      <div className="flex justify-end">
        <Link href="/admin/categories/new" className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          New category
        </Link>
      </div>
    </DataTableShell>
  );
}
