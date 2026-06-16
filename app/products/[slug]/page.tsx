import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, BadgeCheck, ImageIcon, Layers3, ShieldCheck, ShoppingBag, Sparkles, Star, Store, Truck, Zap } from "lucide-react";
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

          <article className="grid gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
            <aside className="space-y-3 lg:sticky lg:top-20">
              <div className="overflow-hidden rounded-2xl border border-[var(--color-border-muted)] bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 sm:p-8">
                  {lowestOffer ? <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[var(--color-brand-red)] shadow-sm ring-1 ring-red-100">Լավագույն գինը գտնված է</span> : null}
                  {imageList[0] ? (
                    <img src={imageList[0]} alt={product.title} className="h-full w-full object-contain object-center mix-blend-multiply drop-shadow-sm" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-sm font-medium text-[var(--color-text-muted)]">
                      <ImageIcon className="h-10 w-10" /> Նկար չկա
                    </div>
                  )}
                </div>
              </div>

              {imageList.length > 1 ? (
                <div className="grid grid-cols-5 gap-2 rounded-2xl border border-[var(--color-border-muted)] bg-white p-2 shadow-[var(--shadow-subtle)]">
                  {imageList.slice(1, 6).map((image, idx) => (
                    <div key={`${image}-${idx}`} className="aspect-square overflow-hidden rounded-xl border border-[var(--color-border-muted)] bg-slate-50 p-2 transition hover:border-slate-300 hover:bg-white">
                      <img src={image} alt={`${product.title} image ${idx + 2}`} className="h-full w-full object-contain object-center mix-blend-multiply" />
                    </div>
                  ))}
                </div>
              ) : null}
            </aside>

            <div className="space-y-4">
              <section className="overflow-hidden rounded-2xl border border-[var(--color-border-muted)] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <div className="border-b border-[var(--color-border-muted)] bg-gradient-to-br from-white via-white to-slate-50 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {category ? <Link href={categoryPath.length ? `/categories/${categoryPath.map((x) => x.slug).join("/")}` : "/categories"} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] transition hover:bg-slate-200"><Layers3 className="h-3.5 w-3.5" /> {category.name}</Link> : null}
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-[var(--color-success-green)] ring-1 ring-green-100"><BadgeCheck className="h-3.5 w-3.5" /> Ստուգված առաջարկներ</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-[var(--color-brand-red)] ring-1 ring-red-100"><Store className="h-3.5 w-3.5" /> {getOfferCountText(offerRows.length)}</span>
                  </div>

                  <h1 className="mt-5 max-w-4xl text-[28px] font-bold leading-tight tracking-tight text-slate-950 sm:text-[34px]">{product.title}</h1>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">{product.short_description || "Համեմատեք ակտիվ առաջարկները, հիմնական բնութագրերը և ընտրեք ամենահարմար խանութը մեկ պարզ էջում։"}</p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[var(--color-border-muted)] bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Սկսած</p><p className="mt-2 text-xl font-bold text-slate-950">{lowestOffer ? <PriceText amountAMD={Number(lowestOffer.price)} /> : "—"}</p></div>
                    <div className="rounded-2xl border border-[var(--color-border-muted)] bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Առկաություն</p><p className="mt-2 text-base font-bold text-slate-950">{stockSummary}</p></div>
                    <div className="rounded-2xl border border-[var(--color-border-muted)] bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Խնայողություն</p><p className="mt-2 text-base font-bold text-slate-950">{savingsPercent ? `մինչև ${savingsPercent}%` : "Համեմատեք"}</p></div>
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_280px]">
                  <div id="offers" className="scroll-mt-24">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-brand-red)]"><ShoppingBag className="h-4 w-4" /> Խանութներ</p>
                        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Ընտրեք լավագույն առաջարկը</h2>
                      </div>
                      <a href="#specifications" className="text-sm font-semibold text-[var(--color-link-blue)] hover:underline">Տեսնել բնութագրերը</a>
                    </div>
                    {offerRows.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {offerRows.map((offer, index) => {
                          const merchant = extractSingle(offer.merchants);
                          const logo = merchantLogoUrl(merchant?.logo_path);
                          return <MerchantOfferCard key={offer.id} merchantName={merchant?.name ?? "Անհայտ խանութ"} merchantLogoUrl={logo} merchantInitials={merchantInitials(merchant?.name)} price={Number(offer.price)} productUrl={offer.product_url} stockStatus={offer.stock_status} updatedAt={offer.updated_at} rank={index + 1} isBestOffer={index === 0} />;
                        })}
                      </div>
                    ) : <EmptyState className="mt-4">Ակտիվ առաջարկներ դեռ չկան։</EmptyState>}
                  </div>

                  <aside className="h-fit rounded-2xl border border-red-100 bg-red-50/70 p-4 xl:sticky xl:top-20">
                    <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-brand-red)]"><Sparkles className="h-4 w-4" /> Արագ ընտրություն</div>
                    <div className="mt-3 text-[26px] font-black leading-tight text-slate-950">{lowestOffer ? <PriceText amountAMD={Number(lowestOffer.price)} /> : "—"}</div>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">Առաջին առաջարկը ամենացածր ակտիվ գինն է։ Բացեք խանութը կամ համեմատեք մնացած առաջարկները։</p>
                    <div className="mt-4 grid gap-2">
                      {lowestOffer?.product_url ? <a href={lowestOffer.product_url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-red)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-brand-red-hover)] focus:outline-none focus:ring-2 focus:ring-red-200">Բացել լավագույնը <ArrowRight className="h-4 w-4" /></a> : null}
                      <a href="#offers" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 text-sm font-bold text-[var(--color-brand-red)] transition hover:bg-red-50">Համեմատել բոլոր գները <ArrowDown className="h-4 w-4" /></a>
                    </div>
                  </aside>
                </div>
              </section>

              {firstSpecHighlights.length > 0 ? (
                <section aria-labelledby="highlights-heading" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <h2 id="highlights-heading" className="sr-only">Հիմնական բնութագրեր</h2>
                  {firstSpecHighlights.map((item) => (
                    <div key={item.key} className="rounded-2xl border border-[var(--color-border-muted)] bg-white p-4 shadow-[var(--shadow-subtle)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{item.name}</p>
                      <p className="mt-2 line-clamp-2 text-sm font-bold text-slate-950">{item.value}</p>
                    </div>
                  ))}
                </section>
              ) : null}
              <section id="specifications" className="scroll-mt-24 rounded-2xl border border-[var(--color-border-muted)] bg-white p-5 shadow-[var(--shadow-subtle)] sm:p-6">
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

              <section className="rounded-2xl border border-[var(--color-border-muted)] bg-white p-5 shadow-[var(--shadow-subtle)] sm:p-6">
                <div className="flex items-center gap-2"><Truck className="h-5 w-5 text-[var(--color-text-muted)]" /><h2 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">Նկարագրություն</h2></div>
                <div className="mt-4 rounded-md bg-slate-50 p-4">
                  <div className="max-w-5xl whitespace-pre-wrap text-sm leading-7 text-[var(--color-text-secondary)]">{product.long_description || product.description || "Մանրամասն նկարագրությունը դեռ հասանելի չէ։"}</div>
                </div>
              </section>

              <section className="rounded-2xl border border-[var(--color-border-muted)] bg-white p-5 shadow-[var(--shadow-subtle)] sm:p-6">
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
                        <Link key={related.id} href={`/products/${related.slug}`} className="group overflow-hidden rounded-2xl border border-[var(--color-border-muted)] bg-white transition hover:border-slate-300 hover:shadow-md">
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
