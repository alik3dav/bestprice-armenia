import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireMerchant } from "@/lib/auth/guards";
import { OfferForm } from "@/components/admin/offer-form";
import { DEFAULT_CURRENCY, parsePriceInput } from "@/lib/money";

const schema = z.object({ productId: z.string().uuid(), stockStatus: z.enum(["in_stock","limited","out_of_stock","preorder"]), status: z.enum(["draft","active","archived"]), merchantSku: z.string().optional(), productUrl: z.string().url().optional().or(z.literal("")), notes: z.string().optional() });

export default async function NewOfferPage({ searchParams }: { searchParams?: Promise<{ error?: string; success?: string }> }) {
  const { supabase, user } = await requireMerchant();
  const params = await searchParams;
  const [{ data: merchant }, productsResult] = await Promise.all([
    supabase.from("merchants").select("id").eq("profile_id", user.id).single(),
    supabase.from("products").select("id,title").order("title", { ascending: true })
  ]);

  async function createOffer(formData: FormData) {"use server";
    const { supabase: c, user: authUser } = await requireMerchant();
    const { data: linkedMerchant } = await c.from("merchants").select("id").eq("profile_id", authUser.id).single();
    if (!linkedMerchant) redirect("/merchant/offers/new?error=Merchant+profile+is+not+linked");
    const parsedPrice = parsePriceInput(formData.get("price"));
    if (!parsedPrice.ok) redirect(`/merchant/offers/new?error=${encodeURIComponent(parsedPrice.error)}`);
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) redirect(`/merchant/offers/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid form")}`);
    const d = parsed.data;
    if (d.status === "active") {
      const { data: existing } = await c.from("product_offers").select("id").eq("merchant_id", linkedMerchant.id).eq("product_id", d.productId).eq("status", "active").maybeSingle();
      if (existing) redirect("/merchant/offers/new?error=An+active+offer+already+exists+for+this+product");
    }
    const { error } = await c.from("product_offers").insert({ merchant_id: linkedMerchant.id, product_id: d.productId, price: parsedPrice.value, currency: DEFAULT_CURRENCY, stock_status: d.stockStatus, status: d.status, product_url: d.productUrl || null, merchant_sku: d.merchantSku || null, notes: d.notes || null, created_by: authUser.id });
    if (error) redirect(`/merchant/offers/new?error=${encodeURIComponent(error.message)}`);
    redirect("/merchant/offers?success=Offer+created");
  }

  return <section className="space-y-4 rounded border bg-white p-4"><div className="flex items-center justify-between gap-3"><div><h1 className="text-xl font-semibold">Create Offer</h1><p className="text-sm text-slate-500">Create a new merchant offer from existing products.</p></div><Link href="/merchant/offers" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Back to offers</Link></div>{params?.error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{params.error}</div> : null}{productsResult.error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{productsResult.error.message}</div> : null}{merchant ? <OfferForm action={createOffer} products={productsResult.data ?? []} backHref="/merchant/offers" submitLabel="Create offer" submitLoadingLabel="Creating..." disableSubmit={(productsResult.data ?? []).length === 0} defaultValues={{ productId: "", price: "", stockStatus: "in_stock", status: "draft", merchantSku: "", productUrl: "", notes: "" }} /> : <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">Merchant profile is not linked.</div>}</section>;
}
