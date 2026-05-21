import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { createClient } from "@/lib/supabase/server";
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
  categories: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null;
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
  merchants: { name: string; slug: string } | { name: string; slug: string }[] | null;
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

function stockLabel(stock: OfferRow["stock_status"]) {
  if (stock === "in_stock") return "In stock";
  if (stock === "limited") return "Limited";
  if (stock === "preorder") return "Preorder";
  return "Out of stock";
}

async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("id,title,slug,description,short_description,long_description,images,category_id,status,categories(id,name,slug)")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  devLog("load-product", error);
  return (product ?? null) as ProductRow | null;
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

  const [{ data: template, error: templateErr }, { data: specValues, error: valuesErr }, { data: offers, error: offersErr }] = await Promise.all([
    supabase.from("specification_groups").select("id,name,category_id").eq("category_id", product.category_id).maybeSingle(),
    supabase.from("product_specification_values").select("field_id,value_text,value_number,value_boolean,value_select").eq("product_id", product.id),
    supabase.from("product_offers").select("id,price,currency,stock_status,product_url,updated_at,merchants(name,slug)").eq("product_id", product.id).eq("status", "active").order("price", { ascending: true }),
  ]);
  devLog("load-template", templateErr); devLog("load-spec-values", valuesErr); devLog("load-offers", offersErr);

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

  return <main className="min-h-screen bg-white text-slate-900">{/* unchanged layout below */}
    <PublicHeader userEmail={userEmail} />
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-600"><ol className="flex flex-wrap items-center gap-2"><li><Link href="/" className="hover:underline">Home</Link></li><li aria-hidden="true" className="text-slate-400">/</li>{category ? <><li><Link href={`/categories/${category.slug}`} className="hover:underline">{category.name}</Link></li><li aria-hidden="true" className="text-slate-400">/</li></> : null}<li aria-current="page" className="font-medium text-slate-900">{product.title}</li></ol></nav><Link href={category ? `/categories/${category.slug}` : "/"} className="inline-block text-sm text-slate-600 hover:underline">← Back to {category ? category.name : "products"}</Link>
      <article className="mt-4 grid gap-8 lg:grid-cols-2"><div className="space-y-3"><div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f6f6f6] p-4">{imageList[0] ? <img src={imageList[0]} alt={product.title} className="h-full w-full object-contain mix-blend-multiply contrast-108 brightness-102" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">No image available.</div>}</div>{imageList.length > 1 ? <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">{imageList.slice(1).map((image, idx) => <div key={`${image}-${idx}`} className="aspect-square overflow-hidden rounded-lg border bg-[#f6f6f6] p-1"><img src={image} alt={`${product.title} image ${idx + 2}`} className="h-full w-full object-contain mix-blend-multiply contrast-108 brightness-102" /></div>)}</div> : null}</div>
      <div className="space-y-4">{category ? <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{category.name}</p> : null}<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{product.title}</h1><p className="text-sm leading-6 text-slate-600">{product.short_description || "No short description available."}</p><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Lowest active offer</p>{lowestOffer ? <p className="mt-1 text-3xl font-bold"><PriceText amountAMD={Number(lowestOffer.price)} /></p> : <p className="mt-1 text-sm text-slate-500">No active offers available right now.</p>}</div></div></article>
      <section className="mt-10 grid gap-8 lg:grid-cols-3"><div className="lg:col-span-2 space-y-8"><section><h2 className="text-xl font-semibold">Description</h2><div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{product.long_description || product.description || "Detailed description is not available yet."}</div></section>
      <section><h2 className="text-xl font-semibold">Specifications</h2>{!hasTemplate ? <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No specification template is attached to this product category yet.</p> : !hasAnySpecValues ? <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No specification values are available for this product yet.</p> : sortedGroups.length > 0 ? <div className="mt-4 space-y-4">{sortedGroups.map((group) => <div key={group.groupName} className="rounded-xl border border-slate-200"><div className="border-b bg-slate-50 px-4 py-2 text-sm font-semibold">{group.groupName}</div><dl className="divide-y">{group.items.map((item) => <div key={item.key} className="grid grid-cols-1 gap-2 px-4 py-3 text-sm sm:grid-cols-2"><dt className="text-slate-600">{item.name}</dt><dd className="font-medium text-slate-900">{item.value}</dd></div>)}</dl></div>)}</div> : <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Specification fields exist, but saved values are empty.</p>}</section></div>
      <aside><h2 className="text-xl font-semibold">Merchant offers</h2>{offerRows.length > 0 ? <div className="mt-4 overflow-hidden rounded-xl border"><table className="min-w-full divide-y text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-3 py-2 font-medium">Merchant</th><th className="px-3 py-2 font-medium">Price</th><th className="px-3 py-2 font-medium">Stock</th><th className="px-3 py-2 font-medium">Updated</th></tr></thead><tbody className="divide-y bg-white">{offerRows.map((offer, index) => { const merchant = extractSingle(offer.merchants); return <tr key={offer.id} className={index === 0 ? "bg-emerald-50/60" : ""}><td className="px-3 py-3"><p className="font-medium">{merchant?.name ?? "Unknown merchant"}</p>{offer.product_url ? <a href={offer.product_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Buy link</a> : <p className="text-xs text-slate-400">No buy link</p>}</td><td className="px-3 py-3 font-semibold"><PriceText amountAMD={Number(offer.price)} /></td><td className="px-3 py-3 text-slate-600">{stockLabel(offer.stock_status)}</td><td className="px-3 py-3 text-slate-500">{new Date(offer.updated_at).toLocaleDateString()}</td></tr>; })}</tbody></table></div> : <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No active offers yet.</p>}</aside>
      </section></section>      <PublicFooter />
    </main>;
}
