import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { createClient } from "@/lib/supabase/server";
import { ShopFilters } from "@/components/public/shop-filters";

type SearchParams = Record<string, string | string[] | undefined>;
type ProductRow = { id: string; title: string; slug: string; description: string | null; short_description: string | null; images: unknown; category_id: string; created_at: string };
type OfferRow = { product_id: string; price: number; currency: string; merchant_id: string; stock_status: string };
type CategoryRow = { id: string; name: string };
type MerchantRow = { id: string; name: string };

export const metadata: Metadata = { title: "Shop | BestPrice Armenia", description: "Browse products and compare offers." };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const many = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);
const hasSupabaseEnv = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const selectedCategories = many(params.category);
  const selectedBrands = many(params.brand);
  const stock = many(params.stock);
  const sort = one(params.sort) ?? "newest";
  const min = Number(one(params.min) ?? "");
  const max = Number(one(params.max) ?? "");

  if (!hasSupabaseEnv()) return <main className="min-h-screen bg-white text-slate-900"><PublicHeader userEmail={null} /><section className="mx-auto w-full max-w-7xl p-6">Supabase not configured.</section></main>;

  const supabase = await createClient();
  const authResult = await supabase.auth.getUser();
  const userEmail = authResult.data.user?.email ?? null;
  const [{ data: categories }, { data: merchants }] = await Promise.all([
    supabase.from("categories").select("id,name").eq("status", "active").order("name"),
    supabase.from("merchants").select("id,name").order("name"),
  ]);

  let query = supabase.from("products").select("id,title,slug,description,short_description,images,category_id,created_at").eq("status", "active").limit(120);
  if (selectedCategories.length) query = query.in("category_id", selectedCategories);
  query = query.order("created_at", { ascending: false });
  const { data: productsData, error: productsError } = await query;
  const products = (productsData ?? []) as ProductRow[];
  const ids = products.map((p) => p.id);

  const { data: offersData } = await (ids.length
    ? supabase.from("product_offers").select("product_id,price,currency,merchant_id,stock_status").in("product_id", ids).eq("status", "active")
    : Promise.resolve({ data: [] }));
  const offers = (offersData ?? []) as OfferRow[];

  const offersByProduct = new Map<string, OfferRow[]>();
  offers.forEach((o) => offersByProduct.set(o.product_id, [...(offersByProduct.get(o.product_id) ?? []), o]));

  const filtered = products.filter((p) => {
    const po = offersByProduct.get(p.id) ?? [];
    if (selectedBrands.length && !po.some((o) => selectedBrands.includes(o.merchant_id))) return false;
    if (stock.length && !po.some((o) => stock.includes(o.stock_status))) return false;
    const lowest = po.reduce<number | null>((m, o) => (m === null || o.price < m ? o.price : m), null);
    if (!Number.isNaN(min) && lowest !== null && lowest < min) return false;
    if (!Number.isNaN(max) && lowest !== null && lowest > max) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const lowA = (offersByProduct.get(a.id) ?? []).reduce<number | null>((m, o) => (m === null || o.price < m ? o.price : m), null);
    const lowB = (offersByProduct.get(b.id) ?? []).reduce<number | null>((m, o) => (m === null || o.price < m ? o.price : m), null);
    if (sort === "lowest") return (lowA ?? Number.POSITIVE_INFINITY) - (lowB ?? Number.POSITIVE_INFINITY);
    if (sort === "highest") return (lowB ?? Number.NEGATIVE_INFINITY) - (lowA ?? Number.NEGATIVE_INFINITY);
    if (sort === "popular") return a.title.localeCompare(b.title);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return <main className="min-h-screen bg-white text-slate-900"><PublicHeader userEmail={userEmail} />
    <section className="w-full px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto w-full max-w-[1600px]"><div className="mb-5 flex items-center justify-between"><h1 className="text-2xl font-semibold">Shop</h1><Link href="/" className="text-sm text-slate-600 hover:underline">Back to landing</Link></div>
      <details className="mb-4 border-b border-slate-200 pb-4 lg:hidden"><summary className="cursor-pointer text-sm font-medium text-slate-800">Filters</summary><div className="pt-4"><ShopFilters categories={(categories ?? []) as CategoryRow[]} merchants={(merchants ?? []) as MerchantRow[]} params={params} /></div></details>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]"><aside className="hidden lg:block"><div className="sticky top-20 pr-6"><ShopFilters categories={(categories ?? []) as CategoryRow[]} merchants={(merchants ?? []) as MerchantRow[]} params={params} /></div></aside>
      <div>{productsError ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Failed to load products.</p> : null}
      {sorted.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">No products found for selected filters.</p> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{sorted.map((p) => { const po = offersByProduct.get(p.id) ?? []; const lowest = po.reduce<OfferRow | null>((m, o) => (!m || o.price < m.price ? o : m), null); const image = Array.isArray(p.images) ? p.images[0] : null; return <Link href={`/products/${p.slug}`} key={p.id} className="group block rounded-2xl bg-white p-2 transition hover:-translate-y-0.5 hover:shadow-md"><article><div className="relative aspect-square rounded-xl bg-[#f6f6f6] p-3">{image ? <img src={image} alt={p.title} className="h-full w-full object-contain" /> : <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">No image</div>}</div><div className="space-y-1 px-1 pb-1 pt-3"><h3 className="line-clamp-2 text-[15px] font-bold leading-5 text-black">{p.title}</h3><p className="line-clamp-2 text-[13px] leading-5 text-slate-500">{p.short_description || p.description || "No short description available."}</p><div className="pt-1">{lowest ? <p className="text-[20px] font-bold leading-6 text-black">{lowest.price} {lowest.currency}</p> : <p className="text-[20px] font-bold leading-6 text-slate-300">—</p>}</div></div></article></Link>; })}</div>}</div></div>
    </div></section></main>;
}

