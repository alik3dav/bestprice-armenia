import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, BadgeCheck, ImageIcon, Layers3, ShieldCheck, ShoppingBag, Star, Store, Truck, Zap } from "lucide-react";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { createClient } from "@/lib/supabase/server";
import { CategoryBreadcrumbs, breadcrumbJsonLd, type BreadcrumbItem } from "@/components/public/category-breadcrumbs";
import { MerchantOfferCard } from "@/components/public/merchant-offer-card";
import { EmptyState } from "@/components/public/state-messages";
import { PriceText } from "@/components/public/price-text";

type PageProps = { params: Promise<{ slug: string }> };

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  long_description: string | null;
  images: unknown;
  category_id: string;
  status: "draft" | "active" | "archived";
  categories: { id: string; name: string; slug: string; parent_id?: string | null } | { id: string; name: string; slug: string; parent_id?: string | null }[] | null;
};

type TemplateRow = { id: string; name: string; category_id: string };
type TemplateGroupRow = { id: string; name: string; sort_order: number; template_id: string };
type SpecFieldRow = { id: string; name: string; key: string; field_type: "text" | "number" | "boolean" | "select" | "multi-select"; sort_order: number; template_group_id: string };
type SpecValueRow = { field_id: string; value_text: string | null; value_number: number | null; value_boolean: boolean | null; value_select: string | null };
type OfferRow = {
  id: string;
  price: number;
  currency: string;
  stock_status: "in_stock" | "limited" | "out_of_stock" | "preorder";
  product_url: string | null;
  updated_at: string;
  merchants: { name: string; slug: string; logo_path?: string | null } | { name: string; slug: string; logo_path?: string | null }[] | null;
};

function hasSupabaseEnv() { return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); }
function extractSingle<T>(value: T | T[] | null): T | null { if (!value) return null; return Array.isArray(value) ? (value[0] ?? null) : value; }
function devLog(label: string, error: { message?: string; details?: string; hint?: string; code?: string } | null) {
  if (process.env.NODE_ENV !== "development" || !error) return;
  console.error(`[product-page-data] ${label}`, { message: error.message, details: error.details, hint: error.hint, code: error.code });
}

function formatSpecValue(value: Pick<SpecValueRow, "value_text" | "value_number" | "value_boolean" | "value_select">) {
  if (value.value_number !== null) return String(value.value_number);
  if (value.value_boolean !== null) return value.value_boolean ? "Yes" : "No";
  if (value.value_select) return value.value_select;
  if (!value.value_text) return null;
  const trimmed = value.value_text.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try { const parsed = JSON.parse(trimmed); if (Array.isArray(parsed)) return parsed.join(", "); } catch {}
  }
  return trimmed;
}

function getOfferCountText(count: number) {
  return `${count} խանութ${count === 1 ? "ում" : "ներում"}`;
}

function getStockSummary(offers: OfferRow[]) {
  const inStock = offers.filter((offer) => offer.stock_status === "in_stock" || offer.stock_status === "limited").length;
  if (offers.length === 0) return "Առաջարկներ չկան";
  return inStock > 0 ? `${inStock} առկա առաջարկ` : "Ստուգեք հասանելիությունը";
}

function getSavingsPercent(offers: OfferRow[]) {
  if (offers.length < 2) return null;
  const lowest = Number(offers[0]?.price ?? 0);
  const highest = Number(offers[offers.length - 1]?.price ?? 0);
  if (!lowest || !highest || highest <= lowest) return null;
  return Math.round(((highest - lowest) / highest) * 100);
}

function merchantInitials(name: string | undefined) {
  const value = (name ?? "Խանութ").trim();
  return value.split(/\s+/).slice(0, 2).map((x) => x[0]?.toUpperCase() ?? "").join("") || "M";
}

function merchantLogoUrl(path: string | null | undefined) {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_MERCHANT_LOGOS_BUCKET ?? "merchant-logos";
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("id,title,slug,description,short_description,long_description,images,category_id,status,categories(id,name,slug,parent_id)")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  devLog("load-product", error);
  return (product ?? null) as ProductRow | null;
}

async function getCategoryAncestors(categoryId: string) {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id,name,slug,parent_id").eq("status", "active");
  const byId = new Map((categories ?? []).map((c) => [c.id, c]));
  const chain = [];
  let current = byId.get(categoryId);
  while (current) {
    chain.unshift(current);
    current = current.parent_id ? byId.get(current.parent_id) : undefined;
  }
  return chain;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!hasSupabaseEnv()) return { title: "Ապրանք | BestPrice Armenia", description: "Ապրանքի տվյալներ և խանութների վերջին առաջարկները։" };
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Ապրանքը չի գտնվել | BestPrice Armenia", description: "Այս ապրանքը հասանելի չէ։" };
  const description = product.short_description?.trim() || product.description?.trim() || `${product.title} ապրանքի բնութագրերը և խանութների առաջարկների համեմատումը BestPrice Armenia-ում։`;
  return { title: `${product.title} | BestPrice Armenia`, description, alternates: { canonical: `/products/${product.slug}` } };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  if (!hasSupabaseEnv()) notFound();

  const supabase = await createClient();
  const authResult = await supabase.auth.getUser();
  const userEmail = authResult.data.user?.email ?? null;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [{ data: template, error: templateErr }, { data: specValues, error: valuesErr }, { data: offers, error: offersErr }, { data: relatedProducts, error: relatedErr }] = await Promise.all([
    supabase.from("specification_groups").select("id,name,category_id").eq("category_id", product.category_id).maybeSingle(),
    supabase.from("product_specification_values").select("field_id,value_text,value_number,value_boolean,value_select").eq("product_id", product.id),
    supabase.from("product_offers").select("id,price,currency,stock_status,product_url,updated_at,merchants(name,slug,logo_path)").eq("product_id", product.id).eq("status", "active").order("price", { ascending: true }),
    supabase.from("products").select("id,title,slug,images").eq("status", "active").eq("category_id", product.category_id).neq("id", product.id).limit(8),
  ]);
  devLog("load-template", templateErr); devLog("load-spec-values", valuesErr); devLog("load-offers", offersErr); devLog("load-related", relatedErr);

  const templateRow = (template ?? null) as TemplateRow | null;
  const valueRows = (specValues ?? []) as SpecValueRow[];
  const offerRows = (offers ?? []) as OfferRow[];

  const [groupRowsResult, fieldRowsResult] = templateRow
    ? await Promise.all([
        supabase.from("specification_template_groups").select("id,name,sort_order,template_id").eq("template_id", templateRow.id).order("sort_order", { ascending: true }),
        supabase.from("specification_fields").select("id,name,key,field_type,sort_order,template_group_id").order("sort_order", { ascending: true }),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];
  devLog("load-template-groups", groupRowsResult.error); devLog("load-fields", fieldRowsResult.error);

  const groupRows = (groupRowsResult.data ?? []) as TemplateGroupRow[];
  const groupIdSet = new Set(groupRows.map((g) => g.id));
  const fieldRows = ((fieldRowsResult.data ?? []) as SpecFieldRow[]).filter((f) => groupIdSet.has(f.template_group_id));
  const valueByFieldId = new Map(valueRows.map((v) => [v.field_id, v]));

  const sortedGroups = groupRows.map((group) => ({
    groupName: group.name,
    sort: group.sort_order,
    items: fieldRows
      .filter((f) => f.template_group_id === group.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((field) => {
        const value = valueByFieldId.get(field.id);
        const text = value ? formatSpecValue(value) : null;
        return text ? { key: field.id, name: field.name, value: text } : null;
      })
      .filter((item): item is { key: string; name: string; value: string } => Boolean(item)),
  })).filter((g) => g.items.length > 0).sort((a, b) => a.sort - b.sort);

  const hasTemplate = Boolean(templateRow);
  const hasAnySpecValues = valueRows.some((v) => formatSpecValue(v));
  const lowestOffer = offerRows[0] ?? null;
  const imageList = Array.isArray(product.images) ? product.images.filter((v): v is string => typeof v === "string" && Boolean(v.trim())) : [];
  const category = extractSingle(product.categories);
  const categoryPath = category ? await getCategoryAncestors(category.id) : [];
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Գլխավոր", href: "/" },
    { label: "Կատեգորիաներ", href: "/categories" },
    ...categoryPath.map((c) => ({ label: c.name, href: `/categories/${categoryPath.slice(0, categoryPath.findIndex((x) => x.id === c.id) + 1).map((x) => x.slug).join("/")}` })),
    { label: product.title },
  ];
  const breadcrumbLd = breadcrumbJsonLd(
    breadcrumbItems.filter((i): i is { label: string; href: string } => Boolean(i.href)).concat([{ label: product.title, href: `/products/${product.slug}` }]),
    process.env.NEXT_PUBLIC_SITE_URL,
  );

  const firstSpecHighlights = sortedGroups.flatMap((group) => group.items).slice(0, 4);
  const savingsPercent = getSavingsPercent(offerRows);
  const stockSummary = getStockSummary(offerRows);

  return (
    <main className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]">
      <PublicHeader userEmail={userEmail} />

      <section className="w-full px-3 pb-10 pt-4 sm:px-5 lg:px-6">
        <div className="mx-auto w-full max-w-[1200px]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

          <div className="mb-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 shadow-[var(--shadow-subtle)]">
            <CategoryBreadcrumbs items={breadcrumbItems} />
          </div>

          <article className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)_280px] lg:items-start">
            <aside className="space-y-3 lg:sticky lg:top-20">
              <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-subtle)]">
                <div className="relative aspect-square overflow-hidden rounded-md bg-slate-50 p-5 sm:p-6">
                  {imageList[0] ? (
                    <img src={imageList[0]} alt={product.title} className="h-full w-full object-contain object-center mix-blend-multiply" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-sm font-medium text-[var(--color-text-muted)]">
                      <ImageIcon className="h-10 w-10" /> Նկար չկա
                    </div>
                  )}
                </div>
              </div>

              {imageList.length > 1 ? (
                <div className="grid grid-cols-5 gap-2">
                  {imageList.slice(1, 6).map((image, idx) => (
                    <div key={`${image}-${idx}`} className="aspect-square overflow-hidden rounded-md border border-[var(--color-border)] bg-white p-2 transition hover:border-slate-300">
                      <img src={image} alt={`${product.title} image ${idx + 2}`} className="h-full w-full object-contain object-center mix-blend-multiply" />
                    </div>
                  ))}
                </div>
              ) : null}
            </aside>

            <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-subtle)] sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                {category ? <Link href={categoryPath.length ? `/categories/${categoryPath.map((x) => x.slug).join("/")}` : "/categories"} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)] transition hover:bg-slate-200"><Layers3 className="h-3.5 w-3.5" /> {category.name}</Link> : null}
                <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-[var(--color-success-green)] ring-1 ring-green-100"><BadgeCheck className="h-3.5 w-3.5" /> Գինը ստուգված է</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)] ring-1 ring-slate-200"><Store className="h-3.5 w-3.5" /> {getOfferCountText(offerRows.length)}</span>
              </div>

              <h1 className="mt-4 text-[24px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-[26px]">{product.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">{product.short_description || "Համեմատեք ակտիվ առաջարկները, ուսումնասիրեք հիմնական բնութագրերը և ընտրեք ամենաշահավետ խանութը Հայաստանում։"}</p>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <div className="rounded-md border border-[var(--color-border-muted)] bg-slate-50 p-3"><p className="text-xs font-medium text-[var(--color-text-muted)]">Հասանելիություն</p><p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">{stockSummary}</p></div>
                <div className="rounded-md border border-[var(--color-border-muted)] bg-slate-50 p-3"><p className="text-xs font-medium text-[var(--color-text-muted)]">Հնարավոր խնայողություն</p><p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">{savingsPercent ? `մինչև ${savingsPercent}%` : "Համեմատեք գները"}</p></div>
                <div className="rounded-md border border-[var(--color-border-muted)] bg-slate-50 p-3"><p className="text-xs font-medium text-[var(--color-text-muted)]">Վստահություն</p><p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-primary)]"><ShieldCheck className="h-4 w-4 text-[var(--color-success-green)]" /> Վստահելի խանութներ</p></div>
              </div>
            </section>

            <aside className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-subtle)] lg:sticky lg:top-20">
              <p className="text-xs font-medium text-[var(--color-text-muted)]">Լավագույն գին</p>
              <div className="mt-1 text-[22px] font-bold leading-tight text-[var(--color-price-text)]">{lowestOffer ? <PriceText amountAMD={Number(lowestOffer.price)} /> : "—"}</div>
              <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">Գները դասավորված են ամենացածրից բարձր՝ արագ համեմատման համար։</p>
              <div className="mt-4 grid gap-2">
                <a href="#offers" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--color-brand-red)] px-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-red-hover)] focus:outline-none focus:ring-2 focus:ring-red-200">Տեսնել առաջարկները <ArrowDown className="h-4 w-4" /></a>
                {lowestOffer?.product_url ? <a href={lowestOffer.product_url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[var(--color-border)] px-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-slate-50">Բացել լավագույնը <ArrowRight className="h-4 w-4" /></a> : <a href="#specifications" className="inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--color-border)] px-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-slate-50">Դիտել բնութագրերը</a>}
              </div>
            </aside>

            <div className="space-y-4 lg:col-span-2 lg:col-start-2">
              {lowestOffer ? (() => {
                const lowestMerchant = extractSingle(lowestOffer.merchants);
                const lowestMerchantLogo = merchantLogoUrl(lowestMerchant?.logo_path);
                return (
                  <section aria-labelledby="best-offer-heading" className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-subtle)] sm:p-5">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-brand-red)]">Առաջարկվող ընտրություն</p>
                        <h2 id="best-offer-heading" className="mt-1 text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">Այս պահին լավագույն առաջարկը</h2>
                      </div>
                      <p className="max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">Ամենացածր ակտիվ գինը ցուցադրվում է առաջինը, իսկ մյուս խանութները մնում են հեշտ համեմատելի։</p>
                    </div>
                    <div className="mt-3">
                      <MerchantOfferCard
                        merchantName={lowestMerchant?.name ?? "Անհայտ խանութ"}
                        merchantLogoUrl={lowestMerchantLogo}
                        merchantInitials={merchantInitials(lowestMerchant?.name)}
                        price={Number(lowestOffer.price)}
                        productUrl={lowestOffer.product_url}
                        stockStatus={lowestOffer.stock_status}
                        updatedAt={lowestOffer.updated_at}
                        isBestOffer
                      />
                    </div>
                  </section>
                );
              })() : <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm font-medium text-[var(--color-text-secondary)]">Այս պահին ակտիվ առաջարկներ չկան։ Վերադարձեք ավելի ուշ՝ նոր գները տեսնելու համար։</p>}

              <section id="offers" className="scroll-mt-24 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-subtle)] sm:p-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]"><ShoppingBag className="h-4 w-4" /> Շուկա</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">Խանութների առաջարկներ</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">Դասավորված է ըստ գնի, որպեսզի լավագույն տարբերակը անմիջապես երևա, իսկ այլընտրանքները հեշտ համեմատվեն։</p>
                  </div>
                  <div className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-semibold text-[var(--color-text-secondary)]">{getOfferCountText(offerRows.length)}</div>
                </div>
                {offerRows.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {offerRows.map((offer, index) => {
                      const merchant = extractSingle(offer.merchants);
                      const logo = merchantLogoUrl(merchant?.logo_path);
                      return <MerchantOfferCard key={offer.id} merchantName={merchant?.name ?? "Անհայտ խանութ"} merchantLogoUrl={logo} merchantInitials={merchantInitials(merchant?.name)} price={Number(offer.price)} productUrl={offer.product_url} stockStatus={offer.stock_status} updatedAt={offer.updated_at} rank={index + 1} isBestOffer={index === 0} />;
                    })}
                  </div>
                ) : <EmptyState className="mt-4">Ակտիվ առաջարկներ դեռ չկան։</EmptyState>}
              </section>

              {firstSpecHighlights.length > 0 ? (
                <section aria-labelledby="highlights-heading" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <h2 id="highlights-heading" className="sr-only">Հիմնական բնութագրեր</h2>
                  {firstSpecHighlights.map((item) => (
                    <div key={item.key} className="rounded-lg border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-subtle)]">
                      <p className="text-xs font-medium text-[var(--color-text-muted)]">{item.name}</p>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold text-[var(--color-text-primary)]">{item.value}</p>
                    </div>
                  ))}
                </section>
              ) : null}

              <section id="specifications" className="scroll-mt-24 rounded-lg border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-subtle)] sm:p-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]"><Zap className="h-4 w-4" /> Ապրանքի տվյալներ</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">Բնութագրեր</h2>
                  </div>
                  {sortedGroups.length ? <span className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-semibold text-[var(--color-text-secondary)]">{sortedGroups.length} խումբ</span> : null}
                </div>
                {!hasTemplate ? <p className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-medium text-[var(--color-text-secondary)]">Այս կատեգորիային բնութագրերի ձևանմուշ դեռ կցված չէ։</p> : !hasAnySpecValues ? <p className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-medium text-[var(--color-text-secondary)]">Այս ապրանքի բնութագրերը դեռ լրացված չեն։</p> : sortedGroups.length > 0 ? (
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    {sortedGroups.map((group) => (
                      <div key={group.groupName} className="rounded-lg border border-[var(--color-border)] bg-slate-50 p-3">
                        <h3 className="text-base font-semibold tracking-tight text-[var(--color-text-primary)]">{group.groupName}</h3>
                        <dl className="mt-3 divide-y divide-[var(--color-border-muted)] rounded-md border border-[var(--color-border-muted)] bg-white">
                          {group.items.map((item) => (
                            <div key={item.key} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 px-3 py-2.5">
                              <dt className="text-sm font-medium text-[var(--color-text-secondary)]">{item.name}</dt>
                              <dd className="text-right text-sm font-semibold leading-5 text-[var(--color-text-primary)]">{item.value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    ))}
                  </div>
                ) : <p className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-medium text-[var(--color-text-secondary)]">Բնութագրերի դաշտեր կան, բայց արժեքները դեռ դատարկ են։</p>}
              </section>

              <section className="rounded-lg border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-subtle)] sm:p-5">
                <div className="flex items-center gap-2"><Truck className="h-5 w-5 text-[var(--color-text-muted)]" /><h2 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">Նկարագրություն</h2></div>
                <div className="mt-4 rounded-md bg-slate-50 p-4">
                  <div className="max-w-5xl whitespace-pre-wrap text-sm leading-7 text-[var(--color-text-secondary)]">{product.long_description || product.description || "Մանրամասն նկարագրությունը դեռ հասանելի չէ։"}</div>
                </div>
              </section>

              <section className="rounded-lg border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-subtle)] sm:p-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]"><Star className="h-4 w-4" /> Շարունակեք ուսումնասիրել</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">Նման ապրանքներ</h2>
                  </div>
                  {category ? <Link href={categoryPath.length ? `/categories/${categoryPath.map((x) => x.slug).join("/")}` : "/categories"} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[var(--color-border)] px-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-slate-50">Տեսնել կատեգորիան <ArrowRight className="h-4 w-4" /></Link> : null}
                </div>
                {relatedProducts && relatedProducts.length > 0 ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {relatedProducts.map((related) => {
                      const relatedImages = Array.isArray(related.images) ? related.images.filter((v): v is string => typeof v === "string" && Boolean(v.trim())) : [];
                      return (
                        <Link key={related.id} href={`/products/${related.slug}`} className="group overflow-hidden rounded-lg border border-[var(--color-border)] bg-white transition hover:border-slate-300">
                          <div className="aspect-square overflow-hidden bg-slate-50 p-4">
                            {relatedImages[0] ? <img src={relatedImages[0]} alt={related.title} className="h-full w-full object-contain object-center mix-blend-multiply transition duration-300 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-muted)]">Նկար չկա</div>}
                          </div>
                          <div className="p-3">
                            <p className="line-clamp-2 text-sm font-medium leading-5 text-[var(--color-text-primary)]">{related.title}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : <p className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-medium text-[var(--color-text-secondary)]">Նման ապրանքներ դեռ չկան։</p>}
              </section>
            </div>
          </article>
        </div>
      </section>

      <PublicFooter />
    </main>
  );

}
