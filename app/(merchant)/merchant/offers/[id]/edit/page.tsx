import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { requireMerchant } from "@/lib/auth/guards";
import { OfferForm } from "@/components/admin/offer-form";
import { DEFAULT_CURRENCY, parsePriceInput } from "@/lib/money";

const schema = z.object({ productId: z.string().uuid(), stockStatus: z.enum(["in_stock","limited","out_of_stock","preorder"]), status: z.enum(["draft","active","archived"]), merchantSku: z.string().optional(), productUrl: z.string().url().optional().or(z.literal("")), notes: z.string().optional() });

export default async function EditOfferPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase, user } = await requireMerchant();
  const [{ data: merchant }, productsResult, offerResult] = await Promise.all([
    supabase.from("merchants").select("id").eq("profile_id", user.id).single(),
    supabase.from("products").select("id,title").order("title", { ascending: true }),
    supabase.from("product_offers").select("id,merchant_id,product_id,price,currency,stock_status,status,merchant_sku,product_url,notes").eq("id", id).single()
  ]);
  if (!merchant || !offerResult.data || offerResult.data.merchant_id !== merchant.id) notFound();

  async function updateOffer(formData: FormData) {"use server";
    const { supabase: c, user: authUser } = await requireMerchant();
    const { data: linkedMerchant } = await c.from("merchants").select("id").eq("profile_id", authUser.id).single();
    if (!linkedMerchant) redirect(`/merchant/offers/${id}/edit?error=Merchant+profile+is+not+linked`);
    const { data: current } = await c.from("product_offers").select("id,merchant_id").eq("id", id).single();
    if (!current || current.merchant_id !== linkedMerchant.id) notFound();
    const parsedPrice = parsePriceInput(formData.get("price"));
    if (!parsedPrice.ok) redirect(`/merchant/offers/${id}/edit?error=${encodeURIComponent(parsedPrice.error)}`);
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) redirect(`/merchant/offers/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid form")}`);
    const d = parsed.data;
    if (d.status === "active") {
      const { data: existing } = await c.from("product_offers").select("id").eq("merchant_id", linkedMerchant.id).eq("product_id", d.productId).eq("status", "active").neq("id", id).maybeSingle();
      if (existing) redirect(`/merchant/offers/${id}/edit?error=An+active+offer+already+exists+for+this+product`);
    }
    const { error } = await c.from("product_offers").update({ product_id: d.productId, price: parsedPrice.value, currency: DEFAULT_CURRENCY, stock_status: d.stockStatus, status: d.status, merchant_sku: d.merchantSku || null, product_url: d.productUrl || null, notes: d.notes || null }).eq("id", id).eq("merchant_id", linkedMerchant.id);
    if (error) redirect(`/merchant/offers/${id}/edit?error=${encodeURIComponent(error.message)}`);
    redirect("/merchant/offers?success=Offer+updated");
  }

  const o = offerResult.data;
  return <section className="space-y-4 rounded border bg-white p-4"><div className="flex items-center justify-between gap-3"><div><h1 className="text-xl font-semibold">Edit Offer</h1><p className="text-sm text-slate-500">Update your merchant offer details.</p></div><Link href="/merchant/offers" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Back to offers</Link></div>{(query?.error || productsResult.error || offerResult.error) ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{query?.error ?? productsResult.error?.message ?? "Failed to load offer."}</div> : null}<OfferForm action={updateOffer} products={productsResult.data ?? []} backHref="/merchant/offers" submitLabel="Save offer" submitLoadingLabel="Saving..." defaultValues={{ productId: o.product_id, price: String(o.price), stockStatus: o.stock_status, status: o.status, merchantSku: o.merchant_sku ?? "", productUrl: o.product_url ?? "", notes: o.notes ?? "" }} /></section>;
}
