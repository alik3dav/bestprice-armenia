import { DataTableShell } from "@/components/admin/data-table-shell";
import { requireAdmin } from "@/lib/auth/guards";

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("product_offers")
    .select("id,price,currency,status,updated_at,products(title),merchants(name,slug)")
    .order("updated_at", { ascending: false });

  return (
    <DataTableShell
      title="Offers Management"
      headers={<tr><th className="p-2">Product</th><th className="p-2">Merchant</th><th className="p-2">Price</th><th className="p-2">Status</th><th className="p-2">Updated</th></tr>}
      columnCount={5}
      state={error ? "error" : (data?.length ?? 0) > 0 ? "ready" : "empty"}
      errorMessage={error?.message}
      total={data?.length ?? 0}
      rows={data?.map((offer) => (
        <tr key={offer.id} className="border-t">
          <td className="p-2">{Array.isArray(offer.products) ? (offer.products[0]?.title ?? "—") : ((offer.products as { title?: string } | null)?.title ?? "—")}</td>
          <td className="p-2">{Array.isArray(offer.merchants) ? (offer.merchants[0] ? `${offer.merchants[0].name} (${offer.merchants[0].slug})` : "—") : ((offer.merchants as { name?: string; slug?: string } | null) ? `${(offer.merchants as { name?: string; slug?: string }).name ?? "—"} (${(offer.merchants as { name?: string; slug?: string }).slug ?? "—"})` : "—")}</td>
          <td className="p-2">{offer.price} {offer.currency}</td>
          <td className="p-2 capitalize">{offer.status === "archived" ? "inactive" : offer.status}</td>
          <td className="p-2">{new Date(offer.updated_at).toLocaleString()}</td>
        </tr>
      ))}
    />
  );
}
