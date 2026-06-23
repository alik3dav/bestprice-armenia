import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductGridCard } from "@/components/public/product-grid-card";
import { ShopFilters } from "@/components/public/shop-filters";
import { EmptyState } from "@/components/public/state-messages";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { createClient } from "@/lib/supabase/server";
import { CategoryBreadcrumbs, breadcrumbJsonLd, type BreadcrumbItem } from "@/components/public/category-breadcrumbs";

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const many = (value: string | string[] | undefined) => (Array.isArray(value) ? value : value ? [value] : []);

const parseNumber = (value: string | undefined) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default async function CategoryHierarchyPage({ params, searchParams }: any) {
  const supabase = await createClient();
  const auth = await supabase.auth.getUser();
  const userEmail = auth.data.user?.email ?? null;
  const [resolvedParams, queryParams] = await Promise.all([params, searchParams]);
  const segments: string[] = resolvedParams.slug;
  const { data: allCats } = await supabase.from("categories").select("id,name,slug,parent_id,status").eq("status", "active");
  const cats = allCats ?? [];

  let current = cats.find((c) => !c.parent_id && c.slug === segments[0]);
  if (!current) notFound();
  const chain = [current];
  for (const seg of segments.slice(1)) {
    current = cats.find((c) => c.parent_id === current!.id && c.slug === seg);
    if (!current) notFound();
    chain.push(current);
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Գլխավոր", href: "/" },
    { label: "Կատեգորիաներ", href: "/categories" },
    ...chain.map((c, i) => ({ label: c.name, href: `/categories/${chain.slice(0, i + 1).map((x) => x.slug).join("/")}` })),
  ];
  breadcrumbItems[breadcrumbItems.length - 1] = { label: breadcrumbItems[breadcrumbItems.length - 1].label };
  const breadcrumbLd = breadcrumbJsonLd(
    [
      ...breadcrumbItems.filter((i): i is { label: string; href: string } => Boolean(i.href)),
      { label: chain[chain.length - 1].name, href: `/categories/${chain.map((c) => c.slug).join("/")}` },
    ],
    process.env.NEXT_PUBLIC_SITE_URL,
  );

  const children = cats.filter((c) => c.parent_id === current!.id);
  if (children.length) return <main className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]"><PublicHeader userEmail={userEmail} /><section className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-5 lg:px-6"><CategoryBreadcrumbs items={breadcrumbItems} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} /><div className="rounded-lg bg-[var(--color-surface)] p-4 sm:p-5"><p className="text-xs font-semibold text-[var(--color-brand-red)]">Ենթակատեգորիաներ</p><h1 className="mt-1 text-2xl font-semibold leading-tight text-[var(--color-text-primary)]">{current!.name}</h1><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{children.map((child) => <Link key={child.id} href={`/categories/${[...segments, child.slug].join("/")}`} className="group flex min-h-20 items-center justify-between rounded-md border border-[var(--color-border-muted)] bg-[var(--color-surface)] p-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-brand-red)] hover:text-[var(--color-brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)] focus:ring-offset-2"><span className="line-clamp-2">{child.name}</span><span aria-hidden="true" className="ml-2 text-[var(--color-text-muted)] transition group-hover:text-[var(--color-brand-red)]">›</span></Link>)}</div></div></section>      <PublicFooter />
    </main>;

  const sort = one(queryParams?.sort) ?? "newest";
  const min = parseNumber(one(queryParams?.min));
  const max = parseNumber(one(queryParams?.max));
  const stock = many(queryParams?.stock);
  const merchants = many(queryParams?.merchant);

  const { data: products } = await supabase
    .from("products")
    .select("id,title,slug,images,created_at")
    .eq("category_id", current!.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(120);
  const productIds = (products ?? []).map((p) => p.id);
  const [{ data: offersData }, templateResult, templateGroupsResult, { data: fieldsData }, { data: specValuesData }] = await Promise.all([
    productIds.length ? supabase.from("product_offers").select("product_id,price,status,merchant_id,stock_status").eq("status", "active").in("product_id", productIds) : Promise.resolve({ data: [] }),
    supabase.from("specification_groups").select("id").eq("category_id", current!.id).maybeSingle(),
    supabase.from("specification_template_groups").select("id,template_id"),
    supabase.from("specification_fields").select("id,name,key,template_group_id,specification_template_groups(name),sort_order").order("sort_order", { ascending: true }),
    productIds.length ? supabase.from("product_specification_values").select("product_id,field_id,value_text,value_number,value_boolean,value_select").in("product_id", productIds) : Promise.resolve({ data: [] }),
  ]);

  const offersByProduct = new Map<string, { product_id: string; price: number; merchant_id: string; stock_status: string }[]>();
  for (const offer of offersData ?? []) offersByProduct.set(offer.product_id, [...(offersByProduct.get(offer.product_id) ?? []), offer]);

  const activeTemplateId = templateResult.data?.id ?? null;
  const validGroupIds = new Set((templateGroupsResult.data ?? []).filter((group) => group.template_id === activeTemplateId).map((group) => group.id));
  const fields = (fieldsData ?? []).filter((field) => field.specification_template_groups && validGroupIds.has(field.template_group_id));
  const fieldIds = new Set(fields.map((field) => field.id));
  const specValues = (specValuesData ?? []).filter((value) => fieldIds.has(value.field_id));
  const productSpecs = new Map<string, string[]>();
  for (const valueRow of specValues) {
    const value = valueRow.value_select ?? (valueRow.value_boolean !== null ? String(valueRow.value_boolean) : valueRow.value_number !== null ? String(valueRow.value_number) : (valueRow.value_text ?? "").trim());
    if (!value) continue;
    productSpecs.set(valueRow.product_id, [...(productSpecs.get(valueRow.product_id) ?? []), `${valueRow.field_id}:${value}`]);
  }

  const selectedSpecKeys = Object.entries(queryParams ?? {})
    .filter(([key, value]) => key.startsWith("spec_") && many(value as string | string[] | undefined).length > 0)
    .flatMap(([key, value]) => many(value as string | string[] | undefined).map((selectedValue) => `${key.replace("spec_", "")}:${selectedValue}`));

  const specFilters = fields
    .map((field) => {
      const group = Array.isArray(field.specification_template_groups) ? field.specification_template_groups[0] : field.specification_template_groups;
      return { fieldId: field.id, fieldName: field.name, key: field.key, groupName: group?.name ?? "General", options: Array.from(new Set(specValues.filter((value) => value.field_id === field.id).map((value) => value.value_select ?? (value.value_boolean !== null ? String(value.value_boolean) : value.value_number !== null ? String(value.value_number) : (value.value_text ?? "").trim())).filter(Boolean))) };
    })
    .filter((filter) => filter.options.length > 0);

  const filtered = (products ?? []).filter((product) => {
    const offers = offersByProduct.get(product.id) ?? [];
    if (merchants.length && !offers.some((offer) => merchants.includes(offer.merchant_id))) return false;
    if (stock.length && !offers.some((offer) => stock.includes(offer.stock_status))) return false;
    const lowest = offers.reduce((lowestPrice, offer) => (lowestPrice === null || offer.price < lowestPrice ? offer.price : lowestPrice), null as number | null);
    if (min !== null && lowest !== null && lowest < min) return false;
    if (max !== null && lowest !== null && lowest > max) return false;
    if (selectedSpecKeys.length && !selectedSpecKeys.every((selected) => (productSpecs.get(product.id) ?? []).includes(selected))) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const lowA = (offersByProduct.get(a.id) ?? []).reduce((lowestPrice, offer) => (lowestPrice === null || offer.price < lowestPrice ? offer.price : lowestPrice), null as number | null);
    const lowB = (offersByProduct.get(b.id) ?? []).reduce((lowestPrice, offer) => (lowestPrice === null || offer.price < lowestPrice ? offer.price : lowestPrice), null as number | null);
    if (sort === "lowest") return (lowA ?? Number.POSITIVE_INFINITY) - (lowB ?? Number.POSITIVE_INFINITY);
    if (sort === "highest") return (lowB ?? Number.NEGATIVE_INFINITY) - (lowA ?? Number.NEGATIVE_INFINITY);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const hasAnyFilters = merchants.length > 0 || stock.length > 0 || selectedSpecKeys.length > 0 || min !== null || max !== null;

  return <main className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]"><PublicHeader userEmail={userEmail} /><section className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-5 lg:px-6"><CategoryBreadcrumbs items={breadcrumbItems} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} /><div className="mb-4 rounded-lg bg-[var(--color-surface)] p-4 sm:p-5"><p className="text-xs font-semibold text-[var(--color-brand-red)]">Կատեգորիա</p><h1 className="mt-1 text-2xl font-semibold leading-tight text-[var(--color-text-primary)]">{current!.name}</h1><p className="mt-2 text-sm text-[var(--color-text-secondary)]">{products?.length ?? 0} ապրանք՝ նույն չափի նկարներով և համեմատելի քարտերով։</p></div><div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]"><aside className="lg:pr-0"><div className="sticky top-20"><ShopFilters params={queryParams ?? {}} merchantIds={Array.from(new Set((offersData ?? []).map((offer) => offer.merchant_id)))} specFilters={specFilters} /></div></aside><div className="min-w-0 rounded-lg bg-[var(--color-surface)] p-3 sm:p-4"><div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-[var(--color-text-primary)]">{sorted.length} ապրանք</p><p className="text-xs text-[var(--color-text-muted)]">Դասավորումը՝ {sort === "lowest" ? "ցածր գին" : sort === "highest" ? "բարձր գին" : "նորերը"}</p></div>{(products ?? []).length === 0 ? <EmptyState className="p-8">No products in this category yet.</EmptyState> : sorted.length === 0 && hasAnyFilters ? <EmptyState className="p-8">Products exist, but no results match the selected filters.</EmptyState> : sorted.length === 0 ? <EmptyState className="p-8">No products found for selected filters.</EmptyState> : <div className="grid grid-cols-2 items-stretch gap-3 md:grid-cols-3 xl:grid-cols-5">{sorted.map((p) => { const offers = offersByProduct.get(p.id) ?? []; const lowest = offers.reduce((lowestPrice, offer) => (lowestPrice === null || offer.price < lowestPrice ? offer.price : lowestPrice), null as number | null); return <ProductGridCard key={p.id} product={p} lowestPriceAMD={lowest} activeOfferCount={offers.length} />; })}</div>}</div></div></section>      <PublicFooter />
    </main>;
}
