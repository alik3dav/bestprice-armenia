import Link from "next/link";
import { redirect } from "next/navigation";
import { requireMerchant } from "@/lib/auth/guards";
import { PriceText } from "@/components/public/price-text";
import { DataTableShell } from "@/components/admin/data-table-shell";

export default async function MerchantOffersPage({ searchParams }: { searchParams?: Promise<{ error?: string; success?: string }> }) {
  const params = await searchParams;
  const { supabase, user } = await requireMerchant();
  const { data: merchant } = await supabase.from("merchants").select("id").eq("profile_id", user.id).single();
  if (!merchant) return <DataTableShell title="My Offers" state="error" errorMessage="Merchant profile is not linked." columnCount={5} />;

  async function deleteOffer(formData: FormData) {
    "use server";
    const offerId = String(formData.get("offerId") ?? "");
    const { supabase: c, user: authUser } = await requireMerchant();
    const { data: linkedMerchant } = await c.from("merchants").select("id").eq("profile_id", authUser.id).single();
    if (!linkedMerchant) redirect("/merchant/offers?error=Merchant+profile+is+not+linked");
    const { error } = await c.from("product_offers").delete().eq("id", offerId).eq("merchant_id", linkedMerchant.id);
    if (error) redirect(`/merchant/offers?error=${encodeURIComponent(error.message)}`);
    redirect("/merchant/offers?success=Offer+deleted");
  }

  const { data, error } = await supabase.from("product_offers").select("id,price,currency,status,updated_at,products(title)").eq("merchant_id", merchant.id).order("updated_at", { ascending: false });

  return <section className="space-y-3">{params?.success ? <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{params.success}</div> : null}{params?.error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{params.error}</div> : null}<DataTableShell title="My Offers" state={error ? "error" : (data?.length ? "ready" : "empty")} errorMessage={error?.message} total={data?.length ?? 0} columnCount={5} headers={<tr><th className="p-2">Product</th><th className="p-2">Price</th><th className="p-2">Status</th><th className="p-2">Updated</th><th className="p-2 text-right">Actions</th></tr>} rows={(data ?? []).map((offer) => <tr key={offer.id} className="border-t"><td className="p-2">{Array.isArray(offer.products) ? (offer.products[0]?.title ?? "—") : ((offer.products as { title?: string } | null)?.title ?? "—")}</td><td className="p-2"><PriceText amountAMD={Number(offer.price)} /></td><td className="p-2 capitalize">{offer.status === "archived" ? "inactive" : offer.status}</td><td className="p-2">{new Date(offer.updated_at).toLocaleDateString()}</td><td className="p-2"><div className="flex justify-end gap-2"><Link href={`/merchant/offers/${offer.id}/edit`} className="rounded border px-2 py-1 text-xs hover:bg-slate-50">Edit</Link><form action={deleteOffer}><input type="hidden" name="offerId" value={offer.id} /><button className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50">Delete</button></form></div></td></tr>)}>
    <div className="flex justify-end"><Link href="/merchant/offers/new" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">New offer</Link></div>
  </DataTableShell></section>;
}
