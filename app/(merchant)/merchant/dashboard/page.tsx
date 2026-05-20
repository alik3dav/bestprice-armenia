import { createClient } from "@/lib/supabase/server";

export default async function MerchantDashboardPage() {
  const supabase = await createClient();

  const [{ count: offersCount }, { count: activeOffersCount }] = await Promise.all([
    supabase.from("product_offers").select("id", { count: "exact", head: true }),
    supabase.from("product_offers").select("id", { count: "exact", head: true }).eq("status", "active"),
  ]);

  return (
    <div className="grid grid-cols-4 gap-3">
      <article className="rounded border bg-white p-4">
        <p className="text-xs text-slate-500">Total Offers</p>
        <p className="text-2xl font-semibold">{offersCount ?? 0}</p>
      </article>
      <article className="rounded border bg-white p-4">
        <p className="text-xs text-slate-500">Active Offers</p>
        <p className="text-2xl font-semibold">{activeOffersCount ?? 0}</p>
      </article>
      <article className="rounded border bg-white p-4">
        <p className="text-xs text-slate-500">Products to Offer</p>
        <p className="text-2xl font-semibold">—</p>
      </article>
      <article className="rounded border bg-white p-4">
        <p className="text-xs text-slate-500">Next Steps</p>
        <p className="text-sm text-slate-500">Offer management pages will be added here.</p>
      </article>
    </div>
  );
}
