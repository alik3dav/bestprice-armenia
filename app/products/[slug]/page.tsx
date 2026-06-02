import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, BadgeCheck, Heart, ImageIcon, Layers3, Share2, ShieldCheck, ShoppingBag, Sparkles, Star, Store, Truck, Zap } from "lucide-react";
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
  const value = (name ?? "Merchant").trim();
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
  if (!hasSupabaseEnv()) return { title: "Product | BestPrice Armenia", description: "Product details and latest merchant offers." };
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found | BestPrice Armenia", description: "This product is unavailable." };
  const description = product.short_description?.trim() || product.description?.trim() || `View ${product.title} specs and compare merchant offers on BestPrice Armenia.`;
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_34rem),linear-gradient(180deg,#f8fafc_0%,#ffffff_38rem)] text-slate-950">
      <PublicHeader userEmail={userEmail} />

      <section className="w-full px-4 pb-16 pt-6 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <div className="mx-auto w-full max-w-[1680px]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

          <div className="mb-5 rounded-full border border-white/80 bg-white/75 px-4 py-2 shadow-sm shadow-slate-950/[0.03] backdrop-blur">
            <CategoryBreadcrumbs items={breadcrumbItems} />
          </div>

          <article className="grid gap-8 xl:grid-cols-[minmax(380px,0.88fr)_minmax(0,1.12fr)] xl:items-start xl:gap-10 2xl:gap-14">
            <aside className="space-y-4 xl:sticky xl:top-24">
              <div className="overflow-hidden rounded-[2rem] border border-white bg-white p-3 shadow-2xl shadow-slate-950/[0.07]">
                <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_center,#ffffff_0%,#f1f5f9_68%,#e2e8f0_100%)] p-7 sm:p-10">
                  <div aria-hidden="true" className="absolute left-6 top-6 inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Verified product
                  </div>
                  {imageList[0] ? (
                    <img src={imageList[0]} alt={product.title} className="h-full w-full object-contain object-center mix-blend-multiply drop-shadow-[0_28px_38px_rgba(15,23,42,0.12)]" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-sm font-medium text-slate-400">
                      <ImageIcon className="h-12 w-12" /> No image available
                    </div>
                  )}
                </div>
              </div>

              {imageList.length > 1 ? (
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-5">
                  {imageList.slice(1, 6).map((image, idx) => (
                    <div key={`${image}-${idx}`} className="aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                      <img src={image} alt={`${product.title} image ${idx + 2}`} className="h-full w-full object-contain object-center mix-blend-multiply" />
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                <h2 className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">Quick actions</h2>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"><Heart className="h-4 w-4" /> Favorite</button>
                  <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"><Share2 className="h-4 w-4" /> Share</button>
                  <a href="#offers" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-center text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"><ShoppingBag className="h-4 w-4" /> Compare</a>
                  {lowestOffer?.product_url ? <a href={lowestOffer.product_url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-3 text-center text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300">Best offer <ArrowRight className="h-4 w-4" /></a> : <a href="#specifications" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 px-3 text-center text-sm font-bold text-slate-700">Specs</a>}
                </div>
              </div>
            </aside>

            <div className="min-w-0 space-y-8">
              <section className="rounded-[2rem] border border-white bg-white/82 p-5 shadow-2xl shadow-slate-950/[0.06] backdrop-blur sm:p-7 lg:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  {category ? <Link href={categoryPath.length ? `/categories/${categoryPath.map((x) => x.slug).join("/")}` : "/categories"} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-200"><Layers3 className="h-3.5 w-3.5" /> {category.name}</Link> : null}
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100"><BadgeCheck className="h-3.5 w-3.5" /> Price checked</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-100"><Store className="h-3.5 w-3.5" /> {getOfferCountText(offerRows.length)}</span>
                </div>

                <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
                  <div>
                    <h1 className="max-w-4xl text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">{product.title}</h1>
                    <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{product.short_description || "Compare live offers, review essential specifications, and choose the merchant that gives you the best value in Armenia."}</p>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-4 text-white shadow-xl shadow-slate-950/15">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Starting from</p>
                    <div className="mt-2 text-4xl font-black tracking-tight">{lowestOffer ? <PriceText amountAMD={Number(lowestOffer.price)} /> : "—"}</div>
                    <a href="#offers" className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-slate-950 transition hover:bg-slate-100">View offers <ArrowDown className="h-4 w-4" /></a>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Availability</p><p className="mt-2 text-lg font-black text-slate-950">{stockSummary}</p></div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Potential saving</p><p className="mt-2 text-lg font-black text-slate-950">{savingsPercent ? `մինչև ${savingsPercent}%` : "Compare prices"}</p></div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Confidence</p><p className="mt-2 inline-flex items-center gap-2 text-lg font-black text-slate-950"><ShieldCheck className="h-5 w-5 text-emerald-500" /> Trusted merchants</p></div>
                </div>
              </section>

              {lowestOffer ? (() => {
                const lowestMerchant = extractSingle(lowestOffer.merchants);
                const lowestMerchantLogo = merchantLogoUrl(lowestMerchant?.logo_path);
                return (
                  <section aria-labelledby="best-offer-heading" className="space-y-3">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">Recommended purchase path</p>
                        <h2 id="best-offer-heading" className="mt-1 text-2xl font-black tracking-tight text-slate-950">Best offer right now</h2>
                      </div>
                      <p className="max-w-xl text-sm leading-6 text-slate-500">We put the lowest active price first to reduce decision fatigue, then keep every other merchant visible for transparency.</p>
                    </div>
                    <MerchantOfferCard
                      merchantName={lowestMerchant?.name ?? "Unknown merchant"}
                      merchantLogoUrl={lowestMerchantLogo}
                      merchantInitials={merchantInitials(lowestMerchant?.name)}
                      price={Number(lowestOffer.price)}
                      productUrl={lowestOffer.product_url}
                      stockStatus={lowestOffer.stock_status}
                      updatedAt={lowestOffer.updated_at}
                      isBestOffer
                    />
                  </section>
                );
              })() : <p className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-5 text-sm font-medium text-slate-500">No active offers available right now. Check back soon for merchant pricing.</p>}

              <section id="offers" className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-500"><ShoppingBag className="h-4 w-4" /> Marketplace</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Merchant offers</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">Sorted by price so the highest-value choice is immediately visible while alternatives remain easy to scan.</p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{getOfferCountText(offerRows.length)}</div>
                </div>
                {offerRows.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {offerRows.map((offer, index) => {
                      const merchant = extractSingle(offer.merchants);
                      const logo = merchantLogoUrl(merchant?.logo_path);
                      return <MerchantOfferCard key={offer.id} merchantName={merchant?.name ?? "Unknown merchant"} merchantLogoUrl={logo} merchantInitials={merchantInitials(merchant?.name)} price={Number(offer.price)} productUrl={offer.product_url} stockStatus={offer.stock_status} updatedAt={offer.updated_at} rank={index + 1} isBestOffer={index === 0} />;
                    })}
                  </div>
                ) : <EmptyState className="mt-5">No active offers yet.</EmptyState>}
              </section>

              {firstSpecHighlights.length > 0 ? (
                <section aria-labelledby="highlights-heading" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <h2 id="highlights-heading" className="sr-only">Key specification highlights</h2>
                  {firstSpecHighlights.map((item) => (
                    <div key={item.key} className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{item.name}</p>
                      <p className="mt-2 line-clamp-2 text-base font-black text-slate-950">{item.value}</p>
                    </div>
                  ))}
                </section>
              ) : null}

              <section id="specifications" className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-500"><Zap className="h-4 w-4" /> Product intelligence</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Specifications</h2>
                  </div>
                  {sortedGroups.length ? <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{sortedGroups.length} groups</span> : null}
                </div>
                {!hasTemplate ? <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-medium text-slate-500">No specification template is attached to this product category yet.</p> : !hasAnySpecValues ? <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-medium text-slate-500">No specification values are available for this product yet.</p> : sortedGroups.length > 0 ? (
                  <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    {sortedGroups.map((group) => (
                      <div key={group.groupName} className="rounded-[1.35rem] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                        <h3 className="text-lg font-black tracking-tight text-slate-950">{group.groupName}</h3>
                        <dl className="mt-4 space-y-3">
                          {group.items.map((item) => (
                            <div key={item.key} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200/70">
                              <dt className="text-sm font-bold text-slate-500">{item.name}</dt>
                              <dd className="text-right text-sm font-black leading-5 text-slate-950">{item.value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    ))}
                  </div>
                ) : <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-medium text-slate-500">Specification fields exist, but saved values are empty.</p>}
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                <div className="flex items-center gap-2"><Truck className="h-5 w-5 text-slate-500" /><h2 className="text-3xl font-black tracking-tight text-slate-950">Description</h2></div>
                <div className="mt-5 rounded-[1.35rem] bg-slate-50 p-5 sm:p-6">
                  <div className="max-w-5xl whitespace-pre-wrap text-[15px] leading-8 text-slate-700">{product.long_description || product.description || "Detailed description is not available yet."}</div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-500"><Star className="h-4 w-4" /> Keep exploring</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Related products</h2>
                  </div>
                  {category ? <Link href={categoryPath.length ? `/categories/${categoryPath.map((x) => x.slug).join("/")}` : "/categories"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50">View category <ArrowRight className="h-4 w-4" /></Link> : null}
                </div>
                {relatedProducts && relatedProducts.length > 0 ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {relatedProducts.map((related) => {
                      const relatedImages = Array.isArray(related.images) ? related.images.filter((v): v is string => typeof v === "string" && Boolean(v.trim())) : [];
                      return (
                        <Link key={related.id} href={`/products/${related.slug}`} className="group overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-950/[0.06]">
                          <div className="aspect-square overflow-hidden bg-[radial-gradient(circle_at_center,#ffffff_0%,#f1f5f9_72%)] p-5">
                            {relatedImages[0] ? <img src={relatedImages[0]} alt={related.title} className="h-full w-full object-contain object-center mix-blend-multiply transition duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>}
                          </div>
                          <div className="p-4">
                            <p className="line-clamp-2 text-sm font-black leading-5 text-slate-950">{related.title}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-medium text-slate-500">No related products available.</p>}
              </section>
            </div>
          </article>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
