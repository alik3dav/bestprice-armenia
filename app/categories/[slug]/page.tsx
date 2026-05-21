// @ts-nocheck
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public/public-header";
import { ShopFilters } from "@/components/public/shop-filters";
import { createClient } from "@/lib/supabase/server";

const one = (v) => (Array.isArray(v) ? v[0] : v);
const many = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const hasSupabaseEnv = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug} | BestPrice Armenia` };
}

export default async function CategoryPage({ params, searchParams }) {
  const [{ slug }, queryParams] = await Promise.all([params, searchParams]);
  if (!hasSupabaseEnv()) return <main className="min-h-screen bg-white text-slate-900"><PublicHeader userEmail={null} /><section className="mx-auto w-full max-w-7xl p-6">Supabase not configured.</section></main>;
  const supabase = await createClient();
  const authResult = await supabase.auth.getUser();
  const userEmail = authResult.data.user?.email ?? null;
  const { data: category } = await supabase.from("categories").select("id,name,slug").eq("slug", slug).eq("status", "active").maybeSingle();
  if (!category) return notFound();

  const sort = one(queryParams.sort) ?? "newest";
  const min = Number(one(queryParams.min) ?? "");
  const max = Number(one(queryParams.max) ?? "");
  const stock = many(queryParams.stock);
  const merchants = many(queryParams.merchant);

  const { data: productsData, error: productsError } = await supabase.from("products").select("id,title,slug,description,short_description,images,created_at").eq("status", "active").eq("category_id", category.id).order("created_at", { ascending: false }).limit(120);
  const products = productsData ?? [];
  const productIds = products.map((p) => p.id);

  const [{ data: offersData }, { data: fieldsData }, { data: specValuesData }] = await Promise.all([
    productIds.length ? supabase.from("product_offers").select("product_id,price,currency,merchant_id,stock_status").eq("status", "active").in("product_id", productIds) : Promise.resolve({ data: [] }),
    supabase.from("specification_fields").select("id,name,key,template_group_id,specification_template_groups(name)").order("sort_order", { ascending: true }),
    productIds.length ? supabase.from("product_specification_values").select("product_id,field_id,value_text,value_number,value_boolean,value_select").in("product_id", productIds) : Promise.resolve({ data: [] }),
  ]);

  const offers = offersData ?? [];
  const fields = (fieldsData ?? []).filter((f) => f.specification_template_groups);
  const fieldIds = new Set(fields.map((f) => f.id));
  const specValues = (specValuesData ?? []).filter((v) => fieldIds.has(v.field_id));

  const offersByProduct = new Map();
  for (const o of offers) offersByProduct.set(o.product_id, [...(offersByProduct.get(o.product_id) ?? []), o]);
  const productSpecs = new Map();
  for (const v of specValues) {
    const value = v.value_select ?? (v.value_boolean !== null ? String(v.value_boolean) : v.value_number !== null ? String(v.value_number) : (v.value_text ?? "").trim());
    if (!value) continue;
    productSpecs.set(v.product_id, [...(productSpecs.get(v.product_id) ?? []), `${v.field_id}:${value}`]);
  }

  const selectedSpecKeys = Object.entries(queryParams).filter(([k]) => k.startsWith("spec_")).flatMap(([k, v]) => many(v).map((vv) => `${k.replace("spec_", "")}:${vv}`));
  const specFilters = fields.map((f) => ({ fieldId: f.id, fieldName: f.name, key: f.key, groupName: f.specification_template_groups?.name ?? "General", options: Array.from(new Set(specValues.filter((v) => v.field_id === f.id).map((v) => v.value_select ?? (v.value_boolean !== null ? String(v.value_boolean) : v.value_number !== null ? String(v.value_number) : (v.value_text ?? "").trim())).filter(Boolean))) })).filter((g) => g.options.length > 0);

  const filtered = products.filter((p) => {
    const po = offersByProduct.get(p.id) ?? [];
    if (merchants.length && !po.some((o) => merchants.includes(o.merchant_id))) return false;
    if (stock.length && !po.some((o) => stock.includes(o.stock_status))) return false;
    const lowest = po.reduce((m, o) => (m === null || o.price < m ? o.price : m), null);
    if (!Number.isNaN(min) && lowest !== null && lowest < min) return false;
    if (!Number.isNaN(max) && lowest !== null && lowest > max) return false;
    if (selectedSpecKeys.length && !selectedSpecKeys.every((s) => (productSpecs.get(p.id) ?? []).includes(s))) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const lowA = (offersByProduct.get(a.id) ?? []).reduce((m, o) => (m === null || o.price < m ? o.price : m), null);
    const lowB = (offersByProduct.get(b.id) ?? []).reduce((m, o) => (m === null || o.price < m ? o.price : m), null);
    if (sort === "lowest") return (lowA ?? Number.POSITIVE_INFINITY) - (lowB ?? Number.POSITIVE_INFINITY);
    if (sort === "highest") return (lowB ?? Number.NEGATIVE_INFINITY) - (lowA ?? Number.NEGATIVE_INFINITY);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return <main className="min-h-screen bg-white text-slate-900"><PublicHeader userEmail={userEmail} />
    <section className="w-full px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto w-full max-w-[1600px]"><div className="mb-5 flex items-center justify-between"><h1 className="text-2xl font-semibold">{category.name}</h1><Link href="/" className="text-sm text-slate-600 hover:underline">Back to landing</Link></div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]"><aside className="lg:pr-6"><div className="sticky top-20"><ShopFilters params={queryParams} merchantIds={Array.from(new Set(offers.map((o) => o.merchant_id)))} specFilters={specFilters} /></div></aside>
      <div>{productsError ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Failed to load products.</p> : null}
      {sorted.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">No products found for selected filters.</p> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{sorted.map((p) => { const po = offersByProduct.get(p.id) ?? []; const lowest = po.reduce((m, o) => (!m || o.price < m.price ? o : m), null); const image = Array.isArray(p.images) ? p.images[0] : null; return <Link href={`/products/${p.slug}`} key={p.id} className="group block rounded-2xl bg-white p-2 transition hover:-translate-y-0.5 hover:shadow-md"><article><div className="relative aspect-square rounded-xl bg-[#f6f6f6] p-3">{image ? <img src={String(image)} alt={p.title} className="h-full w-full object-contain" /> : <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">No image</div>}</div><div className="space-y-1 px-1 pb-1 pt-3"><h3 className="line-clamp-2 text-[15px] font-bold leading-5 text-black">{p.title}</h3><p className="line-clamp-2 text-[13px] leading-5 text-slate-500">{p.short_description || p.description || "No short description available."}</p><div className="pt-1">{lowest ? <p className="text-[20px] font-bold leading-6 text-black">{lowest.price} {lowest.currency}</p> : <p className="text-[20px] font-bold leading-6 text-slate-300">—</p>}</div></div></article></Link>; })}</div>}</div></div>
    </div></section></main>;
}
