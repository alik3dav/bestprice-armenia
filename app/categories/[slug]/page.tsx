// @ts-nocheck
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { ShopFilters } from "@/components/public/shop-filters";
import { createClient } from "@/lib/supabase/server";
import { ProductGridCard } from "@/components/public/product-grid-card";
import { slugify } from "@/lib/slug";
import { CategoryBreadcrumbs, breadcrumbJsonLd } from "@/components/public/category-breadcrumbs";

const one = (v) => (Array.isArray(v) ? v[0] : v);
const many = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const hasSupabaseEnv = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const isDev = process.env.NODE_ENV !== "production";

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug} | BestPrice Armenia` };
}

export default async function CategoryPage({ params, searchParams }) {
  const [{ slug }, queryParams] = await Promise.all([params, searchParams]);
  if (!hasSupabaseEnv()) return <main className="min-h-screen bg-white text-slate-900"><PublicHeader userEmail={null} /><section className="mx-auto w-full max-w-7xl p-6">Supabase not configured.</section>      <PublicFooter />
    </main>;
  const supabase = await createClient();
  const authResult = await supabase.auth.getUser();
  const userEmail = authResult.data.user?.email ?? null;

  const { data: categoryBySlug, error: categoryError } = await supabase.from("categories").select("id,name,slug,parent_id").eq("slug", slug).eq("status", "active").maybeSingle();
  let category = categoryBySlug;

  if (!category && !categoryError) {
    const { data: categoriesByName } = await supabase.from("categories").select("id,name,slug").eq("status", "active").ilike("name", slug.replace(/-/g, " "));
    category = (categoriesByName ?? []).find((c) => slugify(c.name) === slug) ?? null;
  }

  if (isDev) {
    console.log("[category-page] category resolution", { slug, categoryId: category?.id ?? null, categoryError: categoryError?.message ?? null });
  }

  if (!category) return notFound();


  const { data: categoriesForPath } = await supabase.from("categories").select("id,name,slug,parent_id").eq("status", "active");
  const byId = new Map((categoriesForPath ?? []).map((c) => [c.id, c]));
  const path = [];
  let c = category;
  while (c) {
    path.unshift(c);
    c = c.parent_id ? byId.get(c.parent_id) : null;
  }
  const breadcrumbItems = [
    { label: "Գլխավոր", href: "/" },
    { label: "Կատեգորիաներ", href: "/categories" },
    ...path.map((cat, i) => ({ label: cat.name, href: `/categories/${path.slice(0, i + 1).map((x) => x.slug).join("/")}` })),
  ];
  breadcrumbItems[breadcrumbItems.length - 1].href = undefined;
  const breadcrumbLd = breadcrumbJsonLd([
    ...breadcrumbItems.filter((i) => i.href),
    { label: path[path.length - 1].name, href: `/categories/${path.map((x) => x.slug).join("/")}` },
  ], process.env.NEXT_PUBLIC_SITE_URL);
  const sort = one(queryParams.sort) ?? "newest";
  const min = parseNumber(one(queryParams.min));
  const max = parseNumber(one(queryParams.max));
  const stock = many(queryParams.stock);
  const merchants = many(queryParams.merchant);

  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select("id,title,slug,description,short_description,images,created_at,status,category_id")
    .eq("category_id", category.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(120);

  const products = productsData ?? [];
  const productIds = products.map((p) => p.id);

  const [{ data: offersData, error: offersError }, { data: fieldsData }, { data: specValuesData }] = await Promise.all([
    productIds.length ? supabase.from("product_offers").select("product_id,price,currency,merchant_id,stock_status").eq("status", "active").in("product_id", productIds) : Promise.resolve({ data: [], error: null }),
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

  const selectedSpecKeys = Object.entries(queryParams)
    .filter(([k, v]) => k.startsWith("spec_") && many(v).length > 0)
    .flatMap(([k, v]) => many(v).map((vv) => `${k.replace("spec_", "")}:${vv}`));

  const specFilters = fields
    .map((f) => ({ fieldId: f.id, fieldName: f.name, key: f.key, groupName: f.specification_template_groups?.name ?? "General", options: Array.from(new Set(specValues.filter((v) => v.field_id === f.id).map((v) => v.value_select ?? (v.value_boolean !== null ? String(v.value_boolean) : v.value_number !== null ? String(v.value_number) : (v.value_text ?? "").trim())).filter(Boolean))) }))
    .filter((g) => g.options.length > 0);

  const filtered = products.filter((p) => {
    const po = offersByProduct.get(p.id) ?? [];
    if (merchants.length && !po.some((o) => merchants.includes(o.merchant_id))) return false;
    if (stock.length && !po.some((o) => stock.includes(o.stock_status))) return false;
    const lowest = po.reduce((m, o) => (m === null || o.price < m ? o.price : m), null);
    if (min !== null && lowest !== null && lowest < min) return false;
    if (max !== null && lowest !== null && lowest > max) return false;
    if (selectedSpecKeys.length && !selectedSpecKeys.every((s) => (productSpecs.get(p.id) ?? []).includes(s))) return false;
    return true;
  });

  if (isDev) {
    console.log("[category-page] filters and query", {
      categoryId: category.id,
      activeFilters: { sort, min, max, stock, merchants, selectedSpecKeys },
      productCount: products.length,
      filteredCount: filtered.length,
      productsError: productsError?.message ?? null,
      offersError: offersError?.message ?? null,
    });
  }

  const sorted = [...filtered].sort((a, b) => {
    const lowA = (offersByProduct.get(a.id) ?? []).reduce((m, o) => (m === null || o.price < m ? o.price : m), null);
    const lowB = (offersByProduct.get(b.id) ?? []).reduce((m, o) => (m === null || o.price < m ? o.price : m), null);
    if (sort === "lowest") return (lowA ?? Number.POSITIVE_INFINITY) - (lowB ?? Number.POSITIVE_INFINITY);
    if (sort === "highest") return (lowB ?? Number.NEGATIVE_INFINITY) - (lowA ?? Number.NEGATIVE_INFINITY);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const hasAnyFilters = merchants.length > 0 || stock.length > 0 || selectedSpecKeys.length > 0 || min !== null || max !== null;

  return <main className="min-h-screen bg-white text-slate-900"><PublicHeader userEmail={userEmail} />
    <section className="w-full px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto w-full max-w-[1600px]"><CategoryBreadcrumbs items={breadcrumbItems} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} /><div className="mb-5 flex items-center justify-between"><h1 className="text-2xl font-semibold">{category.name}</h1><Link href="/" className="text-sm text-slate-600 hover:underline">Back to landing</Link></div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]"><aside className="lg:pr-6"><div className="sticky top-20"><ShopFilters params={queryParams} merchantIds={Array.from(new Set(offers.map((o) => o.merchant_id)))} specFilters={specFilters} /></div></aside>
      <div>{productsError ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Failed to load products.</p> : null}
      {products.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">No products in this category yet.</p> : sorted.length === 0 && hasAnyFilters ? <p className="rounded-xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">Products exist, but no results match the selected filters.</p> : sorted.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">No products found for selected filters.</p> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{sorted.map((p) => { const po = offersByProduct.get(p.id) ?? []; const lowest = po.reduce((m, o) => (!m || o.price < m.price ? o : m), null); return <ProductGridCard key={p.id} product={p} lowestPriceAMD={lowest ? Number(lowest.price) : null} />; })}</div>}</div></div>
    </div></section>      <PublicFooter />
    </main>;
}
