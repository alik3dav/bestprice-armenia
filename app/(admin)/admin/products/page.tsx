import Link from "next/link";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { TableRowActions } from "@/components/admin/table-row-actions";
import { requireAdmin } from "@/lib/auth/guards";

async function deleteProduct(id: string) {
  "use server";
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").delete().eq("id", id);
  return error ? { ok: false, message: error.message } : { ok: true, message: "Deleted." };
}

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("id,title,status,updated_at")
    .order("updated_at", { ascending: false });

  if (error && process.env.NODE_ENV === "development") {
    console.error("[admin/products] Failed to load products", error);
  }

  return (
    <DataTableShell
      title="Products Management"
      headers={<tr><th className="p-2">Name</th><th className="p-2">Status</th><th className="p-2">Updated</th><th className="p-2 text-right">Actions</th></tr>}
      state={error ? "error" : (data?.length ?? 0) > 0 ? "ready" : "empty"}
      errorMessage={error?.message}
      total={data?.length ?? 0}
      columnCount={4}
      rows={
        data?.map((product) => (
          <tr key={product.id}>
            <td className="p-2">{product.title}</td>
            <td className="p-2 capitalize">{product.status}</td>
            <td className="p-2">{new Date(product.updated_at).toLocaleString()}</td>
            <td className="p-2">
              <TableRowActions
                itemLabel="product"
                itemName={product.title}
                detailsHref={`/admin/products/${product.id}`}
                editHref={`/admin/products/${product.id}/edit`}
                onDelete={deleteProduct.bind(null, product.id)}
              />
            </td>
          </tr>
        ))
      }
    >
      <div className="flex justify-end">
        <Link href="/admin/products/new" className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          New product
        </Link>
      </div>
    </DataTableShell>
  );
}
