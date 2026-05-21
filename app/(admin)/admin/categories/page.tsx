import Link from "next/link";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { TableRowActions } from "@/components/admin/table-row-actions";
import { requireAdmin } from "@/lib/auth/guards";

async function deleteCategory(id: string) {
  "use server";
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  return error ? { ok: false, message: error.message } : { ok: true, message: "Deleted." };
}

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("categories").select("id,name,slug,parent_id,status,updated_at,products(count)").order("name", { ascending: true });
  const parentMap = new Map((data ?? []).map((c) => [c.id, c.name]));

  return (
    <DataTableShell
      title="Categories Management"
      headers={<tr><th className="p-2">Name</th><th className="p-2">Parent Category</th><th className="p-2">Slug</th><th className="p-2">Product Count</th><th className="p-2">Status</th><th className="p-2 text-right">Actions</th></tr>}
      columnCount={6}
      state={error ? "error" : (data?.length ?? 0) > 0 ? "ready" : "empty"}
      errorMessage={error?.message}
      total={data?.length ?? 0}
      rows={data?.map((category) => (<tr key={category.id}><td className="p-2">{category.parent_id ? <span className="text-slate-400">↳ </span> : null}{category.name}</td><td className="p-2">{category.parent_id ? parentMap.get(category.parent_id) : "—"}</td><td className="p-2">{category.slug}</td><td className="p-2">{category.products?.[0]?.count ?? 0}</td><td className="p-2 capitalize">{category.status}</td><td className="p-2"><TableRowActions itemLabel="category" itemName={category.name} detailsHref={`/admin/categories/${category.id}`} editHref={`/admin/categories/${category.id}/edit`} onDelete={deleteCategory.bind(null, category.id)} /></td></tr>))}
    >
      <div className="flex justify-end"><Link href="/admin/categories/new" className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white">New category</Link></div>
    </DataTableShell>
  );
}
