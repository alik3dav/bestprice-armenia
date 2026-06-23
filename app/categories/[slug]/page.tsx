// @ts-nocheck
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { ShopFilters } from "@/components/public/shop-filters";
import { createClient } from "@/lib/supabase/server";
import { ProductGridCard } from "@/components/public/product-grid-card";
import { slugify } from "@/lib/slug";
import { CategoryCard } from "@/components/public/category-card";
import { CategoryBreadcrumbs, breadcrumbJsonLd } from "@/components/public/category-breadcrumbs";
import { EmptyState, ErrorState } from "@/components/public/state-messages";

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
  if (!hasSupabaseEnv()) return <main className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]"><PublicHeader userEmail={null} /><section className="mx-auto w-full max-w-7xl p-6">Supabase not configured.</section>      <PublicFooter />
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

  const { data: childCategories } = await supabase
    .from("categories")
    .select("id,name,slug,image_url,parent_id")
    .eq("parent_id", category.id)
    .eq("status", "active")
    .order("name", { ascending: true });

  const hasChildren = (childCategories ?? []).length > 0;

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

  const [{ data: offersData, error: offersError }, templateResult, templateGroupsResult, { data: fieldsData }, { data: specValuesData }] = await Promise.all([
    productIds.length ? supabase.from("product_offers").select("product_id,price,currency,merchant_id,stock_status").eq("status", "active").in("product_id", productIds) : Promise.resolve({ data: [], error: null }),
    supabase.from("specification_groups").select("id").eq("category_id", category.id).maybeSingle(),
    supabase.from("specification_template_groups").select("id,template_id"),
    supabase.from("specification_fields").select("id,name,key,template_group_id,specification_template_groups(name),sort_order").order("sort_order", { ascending: true }),
    productIds.length ? supabase.from("product_specification_values").select("product_id,field_id,value_text,value_number,value_boolean,value_select").in("product_id", productIds) : Promise.resolve({ data: [] }),
  ]);

  const offers = offersData ?? [];
  const activeTemplateId = templateResult.data?.id ?? null;
  const validGroupIds = new Set((templateGroupsResult.data ?? []).filter((g) => g.template_id === activeTemplateId).map((g) => g.id));
  const fields = (fieldsData ?? []).filter((f) => f.specification_template_groups && validGroupIds.has(f.template_group_id));
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

  return <main className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]"><PublicHeader userEmail={userEmail} />
    <section className="w-full px-3 py-5 sm:px-5 lg:px-6"><div className="mx-auto w-full max-w-[1200px]"><CategoryBreadcrumbs items={breadcrumbItems} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} /><div className="mb-5 rounded-lg bg-[var(--color-surface)] p-4 sm:p-5"><p className="text-xs font-semibold text-[var(--color-brand-red)]">Կատեգորիա</p><h1 className="mt-1 text-2xl font-semibold leading-tight text-[var(--color-text-primary)]">{category.name}</h1><p className="mt-2 text-sm text-[var(--color-text-secondary)]">Համեմատեք գները, առաջարկները և հասանելիությունը վստահելի խանութներից։</p></div>
      {hasChildren ? (
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-[var(--color-surface)] p-3 sm:grid-cols-3 sm:p-4 lg:grid-cols-4 xl:grid-cols-5">
          {(childCategories ?? []).map((child) => (
            <CategoryCard
              key={child.id}
              name={child.name}
              href={`/categories/${[...path.map((x) => x.slug), child.slug].join("/")}`}
              imageUrl={child.image_url}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]"><aside className="lg:pr-0"><div className="sticky top-20"><ShopFilters params={queryParams} merchantIds={Array.from(new Set(offers.map((o) => o.merchant_id)))} specFilters={specFilters} /></div></aside>
        <div className="min-w-0 rounded-lg bg-[var(--color-surface)] p-3 sm:p-4"><div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-[var(--color-text-primary)]">{sorted.length} ապրանք</p><p className="text-xs text-[var(--color-text-muted)]">Դասավորումը՝ {sort === "lowest" ? "ցածր գին" : sort === "highest" ? "բարձր գին" : "նորերը"}</p></div>{productsError ? <ErrorState>Failed to load products.</ErrorState> : null}
        {products.length === 0 ? <EmptyState className="p-8">No products in this category yet.</EmptyState> : sorted.length === 0 && hasAnyFilters ? <EmptyState className="p-8">Products exist, but no results match the selected filters.</EmptyState> : sorted.length === 0 ? <EmptyState className="p-8">No products found for selected filters.</EmptyState> : <div className="grid grid-cols-2 items-stretch gap-3 md:grid-cols-3 xl:grid-cols-5">{sorted.map((p) => { const po = offersByProduct.get(p.id) ?? []; const lowest = po.reduce((m, o) => (!m || o.price < m.price ? o : m), null); return <ProductGridCard key={p.id} product={p} lowestPriceAMD={lowest ? Number(lowest.price) : null} activeOfferCount={po.length} />; })}</div>}</div></div>
      )}
    </div></section>      <PublicFooter />
    </main>;
}
