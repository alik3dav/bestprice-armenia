import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { createClient } from "@/lib/supabase/server";

type SearchParams = Record<string, string | string[] | undefined>;
type ProductRow = { id: string; title: string; slug: string; description: string | null; short_description: string | null; images: unknown; category_id: string; created_at: string };
type OfferRow = { product_id: string; price: number; currency: string; merchant_id: string; stock_status: string };
type CategoryRow = { id: string; name: string };
type MerchantRow = { id: string; name: string };
type SpecFieldRow = { id: string; name: string };
type SpecValueRow = { product_id: string; field_id: string; value_text: string | null; value_number: number | null; value_boolean: boolean | null; value_select: string | null };

export const metadata: Metadata = { title: "Shop | BestPrice Armenia", description: "Browse products and compare offers." };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const hasSupabaseEnv = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const formatSpecValue = (v: SpecValueRow) => (v.value_number !== null ? String(v.value_number) : v.value_boolean !== null ? (v.value_boolean ? "Yes" : "No") : v.value_select || v.value_text?.trim() || null);

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const selectedCategory = one(params.category) ?? "";
  const selectedMerchant = one(params.merchant) ?? "";
  const stock = one(params.stock) ?? "";
  const sort = one(params.sort) ?? "newest";
  const min = Number(one(params.min) ?? "");
  const max = Number(one(params.max) ?? "");
  const specField = one(params.spec_field) ?? "";
  const specValue = one(params.spec_value) ?? "";

  if (!hasSupabaseEnv()) return <main className="min-h-screen bg-white text-slate-900"><PublicHeader userEmail={null} /><section className="mx-auto w-full max-w-7xl p-6">Supabase not configured.</section></main>;

  const supabase = await createClient();
  const authResult = await supabase.auth.getUser();
  const userEmail = authResult.data.user?.email ?? null;
  const [{ data: categories }, { data: merchants }] = await Promise.all([
    supabase.from("categories").select("id,name").eq("status", "active").order("name"),
    supabase.from("merchants").select("id,name").order("name"),
  ]);

  let query = supabase.from("products").select("id,title,slug,description,short_description,images,category_id,created_at").eq("status", "active").limit(120);
  if (selectedCategory) query = query.eq("category_id", selectedCategory);
  query = sort === "newest" ? query.order("created_at", { ascending: false }) : query.order("title");
  const { data: productsData, error: productsError } = await query;
  const products = (productsData ?? []) as ProductRow[];
  const ids = products.map((p) => p.id);

  const [{ data: offersData }, { data: fieldsData }, { data: valuesData }] = await Promise.all([
    ids.length ? supabase.from("product_offers").select("product_id,price,currency,merchant_id,stock_status").in("product_id", ids).eq("status", "active") : Promise.resolve({ data: [] }),
    selectedCategory ? supabase.from("specification_fields").select("id,name").eq("category_id", selectedCategory).order("name") : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("product_specification_values").select("product_id,field_id,value_text,value_number,value_boolean,value_select").in("product_id", ids) : Promise.resolve({ data: [] }),
  ]);
  const offers = (offersData ?? []) as OfferRow[];
  const specFields = (fieldsData ?? []) as SpecFieldRow[];
  const specValues = (valuesData ?? []) as SpecValueRow[];

  const offersByProduct = new Map<string, OfferRow[]>();
  offers.forEach((o) => offersByProduct.set(o.product_id, [...(offersByProduct.get(o.product_id) ?? []), o]));

  const filtered = products.filter((p) => {
    const po = offersByProduct.get(p.id) ?? [];
    if (selectedMerchant && !po.some((o) => o.merchant_id === selectedMerchant)) return false;
    if (stock && !po.some((o) => o.stock_status === stock)) return false;
    const lowest = po.reduce<number | null>((m, o) => (m === null || o.price < m ? o.price : m), null);
    if (!Number.isNaN(min) && lowest !== null && lowest < min) return false;
    if (!Number.isNaN(max) && lowest !== null && lowest > max) return false;
    if (specField && specValue && !specValues.some((v) => v.product_id === p.id && v.field_id === specField && (formatSpecValue(v) || "").toLowerCase().includes(specValue.toLowerCase()))) return false;
    return true;
  });

  return <main className="min-h-screen bg-white text-slate-900"><PublicHeader userEmail={userEmail} />
    <section className="w-full px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto w-full max-w-[1600px]"><div className="mb-5 flex items-center justify-between"><h1 className="text-2xl font-semibold">Shop</h1><Link href="/" className="text-sm text-slate-600 hover:underline">Back to landing</Link></div>
      <details className="mb-4 rounded-xl border p-3 lg:hidden"><summary className="cursor-pointer font-medium">Filters</summary><div className="pt-3"><FilterForm categories={(categories ?? []) as CategoryRow[]} merchants={(merchants ?? []) as MerchantRow[]} specFields={specFields} params={params} /></div></details>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]"><aside className="hidden lg:block"><div className="sticky top-20 rounded-xl border p-4"><FilterForm categories={(categories ?? []) as CategoryRow[]} merchants={(merchants ?? []) as MerchantRow[]} specFields={specFields} params={params} /></div></aside>
      <div>{productsError ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Failed to load products.</p> : null}
      {filtered.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">No products found for selected filters.</p> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{filtered.map((p) => { const po = offersByProduct.get(p.id) ?? []; const lowest = po.reduce<OfferRow | null>((m, o) => (!m || o.price < m.price ? o : m), null); const image = Array.isArray(p.images) ? p.images[0] : null; return <Link href={`/products/${p.slug}`} key={p.id} className="group block rounded-2xl bg-white p-2 transition hover:-translate-y-0.5 hover:shadow-md"><article><div className="relative aspect-square rounded-xl bg-[#f6f6f6] p-3">{image ? <img src={image} alt={p.title} className="h-full w-full object-contain" /> : <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">No image</div>}</div><div className="space-y-1 px-1 pb-1 pt-3"><h3 className="line-clamp-2 text-[15px] font-bold leading-5 text-black">{p.title}</h3><p className="line-clamp-2 text-[13px] leading-5 text-slate-500">{p.short_description || p.description || "No short description available."}</p><div className="pt-1">{lowest ? <p className="text-[20px] font-bold leading-6 text-black">{lowest.price} {lowest.currency}</p> : <p className="text-[20px] font-bold leading-6 text-slate-300">—</p>}</div></div></article></Link>; })}</div>}</div></div>
    </div></section></main>;
}

function FilterForm({ categories, merchants, specFields, params }: { categories: CategoryRow[]; merchants: MerchantRow[]; specFields: SpecFieldRow[]; params: SearchParams }) {
  const v = (k: string) => (Array.isArray(params[k]) ? params[k]?.[0] : params[k]) ?? "";
  return <form className="space-y-3" method="get"><label className="block text-sm">Category<select name="category" defaultValue={v("category")} className="mt-1 w-full rounded-lg border p-2 text-sm"><option value="">All</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label className="block text-sm">Merchant<select name="merchant" defaultValue={v("merchant")} className="mt-1 w-full rounded-lg border p-2 text-sm"><option value="">All</option>{merchants.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label><div className="grid grid-cols-2 gap-2"><input name="min" defaultValue={v("min")} placeholder="Min price" className="rounded-lg border p-2 text-sm" /><input name="max" defaultValue={v("max")} placeholder="Max price" className="rounded-lg border p-2 text-sm" /></div><label className="block text-sm">Availability<select name="stock" defaultValue={v("stock")} className="mt-1 w-full rounded-lg border p-2 text-sm"><option value="">Any</option><option value="in_stock">In stock</option><option value="limited">Limited</option><option value="out_of_stock">Out of stock</option><option value="preorder">Preorder</option></select></label><label className="block text-sm">Spec field<select name="spec_field" defaultValue={v("spec_field")} className="mt-1 w-full rounded-lg border p-2 text-sm"><option value="">Any</option>{specFields.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label><input name="spec_value" defaultValue={v("spec_value")} placeholder="Spec contains..." className="w-full rounded-lg border p-2 text-sm" /><label className="block text-sm">Sort<select name="sort" defaultValue={v("sort") || "newest"} className="mt-1 w-full rounded-lg border p-2 text-sm"><option value="newest">Newest</option><option value="lowest">Lowest price</option><option value="highest">Highest price</option><option value="popular">Popular / relevant</option></select></label><button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Apply filters</button></form>;
}
