import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { createClient } from "@/lib/supabase/server";
import { PriceText } from "@/components/public/price-text";
import { CategoryBreadcrumbs, breadcrumbJsonLd, type BreadcrumbItem } from "@/components/public/category-breadcrumbs";
import { MerchantOfferCard } from "@/components/public/merchant-offer-card";
import { EmptyState } from "@/components/public/state-messages";

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

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <PublicHeader userEmail={userEmail} />

      <section className="w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <div className="mx-auto w-full max-w-[1700px]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

          <article className="mt-2 grid gap-8 xl:grid-cols-[minmax(0,30%)_minmax(0,70%)] xl:items-start xl:gap-10 2xl:gap-12">
            <aside className="space-y-4 xl:sticky xl:top-24">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f6f6f6] p-4">
                {imageList[0] ? <img src={imageList[0]} alt={product.title} className="h-full w-full object-contain mix-blend-multiply contrast-108 brightness-102" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">No image available.</div>}
              </div>
              {imageList.length > 1 ? (
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                  {imageList.slice(1).map((image, idx) => (
                    <div key={`${image}-${idx}`} className="aspect-square overflow-hidden rounded-lg border bg-[#f6f6f6] p-1">
                      <img src={image} alt={`${product.title} image ${idx + 2}`} className="h-full w-full object-contain mix-blend-multiply contrast-108 brightness-102" />
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="rounded-2xl border border-slate-200 p-4">
                <h2 className="text-sm font-semibold">Quick actions</h2>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">♡ Favorite</button>
                  <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">↗ Share</button>
                  <a href="#offers" className="rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50">⇄ Compare</a>
                  {lowestOffer?.product_url ? <a href={lowestOffer.product_url} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-slate-800">Best offer</a> : <a href="#specifications" className="rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50">Specs</a>}
                </div>
              </div>
            </aside>

            <div className="space-y-5 xl:pl-2">
              <CategoryBreadcrumbs items={breadcrumbItems} />
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{product.title}</h1>
              <p className="text-base leading-7 text-slate-600">{product.short_description || "No short description available."}</p>

              <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Լավագույն առաջարկ</p>
                {lowestOffer ? (() => {
                  const lowestMerchant = extractSingle(lowestOffer.merchants);
                  const lowestMerchantLogo = merchantLogoUrl(lowestMerchant?.logo_path);
                  return (
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-slate-200">
                          {lowestMerchantLogo ? <img src={lowestMerchantLogo} alt={`${lowestMerchant?.name ?? "Merchant"} logo`} className="h-full w-full object-contain object-center" /> : <span className="text-sm font-semibold text-slate-600">{merchantInitials(lowestMerchant?.name)}</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{lowestMerchant?.name ?? "Unknown merchant"}</p>
                          <p className="mt-0.5 text-2xl font-bold leading-none text-slate-950"><PriceText amountAMD={Number(lowestOffer.price)} /></p>
                        </div>
                      </div>

                      {lowestOffer.product_url ? (
                        <a href={lowestOffer.product_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-slate-800">
                          Տեսնել առաջարկը
                        </a>
                      ) : null}
                    </div>
                  );
                })() : <p className="mt-1 text-sm text-slate-500">No active offers available right now.</p>}
              </div>

              <section id="offers" className="mt-8">
                <h2 className="text-2xl font-semibold">Merchant offers</h2>
                {offerRows.length > 0 ? (
                  <>
                    <p className="mt-3 text-sm text-slate-600">{getOfferCountText(offerRows.length)}</p>
                    <div className="mt-4 space-y-2.5">
                      {offerRows.map((offer) => {
                        const merchant = extractSingle(offer.merchants);
                        const logo = merchantLogoUrl(merchant?.logo_path);
                        return <MerchantOfferCard key={offer.id} merchantName={merchant?.name ?? "Unknown merchant"} merchantSlug={merchant?.slug} merchantLogoUrl={logo} merchantInitials={merchantInitials(merchant?.name)} price={Number(offer.price)} productUrl={offer.product_url} />;
                      })}
                    </div>
                  </>
                ) : <EmptyState className="mt-3">No active offers yet.</EmptyState>}
              </section>

              <section id="specifications" className="mt-10">
                <h2 className="text-2xl font-semibold">Specifications</h2>
                {!hasTemplate ? <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No specification template is attached to this product category yet.</p> : !hasAnySpecValues ? <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No specification values are available for this product yet.</p> : sortedGroups.length > 0 ? (
                  <div className="mt-5 max-w-3xl space-y-6">
                    {sortedGroups.map((group) => (
                      <div key={group.groupName}>
                        <h3 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">{group.groupName}</h3>
                        <div className="mt-2.5 space-y-0.5">
                          {group.items.map((item) => (
                            <div key={item.key} className="py-1.5 sm:py-2">
                              <div className="flex flex-col gap-0.5 sm:grid sm:grid-cols-[220px_minmax(0,1fr)_auto] sm:items-center sm:gap-x-0">
                                <p className="text-sm font-medium text-slate-500 sm:pr-0 sm:text-right">{item.name}</p>
                                <div aria-hidden="true" className="hidden h-0 border-t border-dashed border-slate-300/80 sm:block" />
                                <p className="text-sm font-semibold leading-5 text-slate-900 sm:text-left">{item.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Specification fields exist, but saved values are empty.</p>}
              </section>

              <section className="mt-10">
                <h2 className="text-2xl font-semibold">Description</h2>
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                  <div className="max-w-5xl whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{product.long_description || product.description || "Detailed description is not available yet."}</div>
                </div>
              </section>

              <section className="mt-10">
                <h2 className="text-2xl font-semibold">Related products</h2>
                {relatedProducts && relatedProducts.length > 0 ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {relatedProducts.map((related) => {
                      const relatedImages = Array.isArray(related.images) ? related.images.filter((v): v is string => typeof v === "string" && Boolean(v.trim())) : [];
                      return (
                        <Link key={related.id} href={`/products/${related.slug}`} className="overflow-hidden rounded-xl border border-slate-200 transition hover:shadow-md">
                          <div className="aspect-square overflow-hidden bg-[#f6f6f6] p-3">
                            {relatedImages[0] ? <img src={relatedImages[0]} alt={related.title} className="h-full w-full object-contain object-center mix-blend-multiply" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>}
                          </div>
                          <div className="p-4">
                            <p className="line-clamp-2 text-sm font-medium text-slate-900">{related.title}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No related products available.</p>}
              </section>
            </div>
          </article>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
