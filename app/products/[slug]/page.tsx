import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public/public-header";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ slug: string }> };

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  long_description: string | null;
  images: unknown;
  status: "draft" | "active" | "archived";
  categories: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null;
};

type SpecValueRow = {
  value_text: string | null;
  value_number: number | null;
  value_boolean: boolean | null;
  value_select: string | null;
  specification_fields:
    | {
        id: string;
        name: string;
        key: string;
        field_type: "text" | "number" | "boolean" | "select" | "multi-select";
        sort_order: number;
        specification_template_groups:
          | { id: string; name: string; sort_order: number }
          | { id: string; name: string; sort_order: number }[]
          | null;
      }
    | {
        id: string;
        name: string;
        key: string;
        field_type: "text" | "number" | "boolean" | "select" | "multi-select";
        sort_order: number;
        specification_template_groups:
          | { id: string; name: string; sort_order: number }
          | { id: string; name: string; sort_order: number }[]
          | null;
      }[]
    | null;
};

type OfferRow = {
  id: string;
  price: number;
  currency: string;
  stock_status: "in_stock" | "limited" | "out_of_stock" | "preorder";
  product_url: string | null;
  updated_at: string;
  merchants: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function extractSingle<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function formatSpecValue(value: Pick<SpecValueRow, "value_text" | "value_number" | "value_boolean" | "value_select">) {
  if (value.value_number !== null) return String(value.value_number);
  if (value.value_boolean !== null) return value.value_boolean ? "Yes" : "No";
  if (value.value_select) return value.value_select;
  if (!value.value_text) return null;
  const trimmed = value.value_text.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.join(", ");
    } catch {}
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
  const { data: product } = await supabase
    .from("products")
    .select("id,title,slug,description,short_description,long_description,images,status,categories(id,name,slug)")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  return (product ?? null) as ProductRow | null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!hasSupabaseEnv()) {
    return { title: "Product | BestPrice Armenia", description: "Product details and latest merchant offers." };
  }

  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Product Not Found | BestPrice Armenia", description: "This product is unavailable." };
  }

  const description =
    product.short_description?.trim() ||
    product.description?.trim() ||
    `View ${product.title} specs and compare merchant offers on BestPrice Armenia.`;

  return {
    title: `${product.title} | BestPrice Armenia`,
    description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  if (!hasSupabaseEnv()) notFound();

  const supabase = await createClient();
  const authResult = await supabase.auth.getUser();
  const userEmail = authResult.data.user?.email ?? null;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [specValuesResult, offersResult] = await Promise.all([
    supabase
      .from("product_specification_values")
      .select(
        "value_text,value_number,value_boolean,value_select,specification_fields(id,name,key,field_type,sort_order,specification_template_groups(id,name,sort_order))",
      )
      .eq("product_id", product.id),
    supabase
      .from("product_offers")
      .select("id,price,currency,stock_status,product_url,updated_at,merchants(name,slug)")
      .eq("product_id", product.id)
      .eq("status", "active")
      .order("price", { ascending: true }),
  ]);

  const specValues = (specValuesResult.data ?? []) as SpecValueRow[];
  const offers = (offersResult.data ?? []) as OfferRow[];

  const groupedSpecs = new Map<string, { groupName: string; sort: number; items: { key: string; name: string; value: string }[] }>();
  for (const row of specValues) {
    const field = extractSingle(row.specification_fields);
    if (!field) continue;
    const group = extractSingle(field.specification_template_groups);
    const value = formatSpecValue(row);
    if (!value) continue;

    const groupKey = group?.id ?? "ungrouped";
    const existing = groupedSpecs.get(groupKey) ?? {
      groupName: group?.name ?? "General",
      sort: group?.sort_order ?? 9999,
      items: [],
    };

    existing.items.push({ key: field.key, name: field.name, value });
    groupedSpecs.set(groupKey, existing);
  }

  const sortedGroups = [...groupedSpecs.values()]
    .map((group) => ({ ...group, items: group.items.sort((a, b) => a.name.localeCompare(b.name)) }))
    .sort((a, b) => a.sort - b.sort);

  const lowestOffer = offers[0] ?? null;
  const imageList = Array.isArray(product.images) ? product.images.filter((v): v is string => typeof v === "string" && Boolean(v.trim())) : [];
  const category = extractSingle(product.categories);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <PublicHeader userEmail={userEmail} />
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/" className="inline-block text-sm text-slate-600 hover:underline">← Back to products</Link>

        <article className="mt-4 grid gap-8 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f6f6f6] p-4">
              {imageList[0] ? <img src={imageList[0]} alt={product.title} className="h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">No image available.</div>}
            </div>
            {imageList.length > 1 ? (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {imageList.slice(1).map((image, idx) => (
                  <div key={`${image}-${idx}`} className="aspect-square overflow-hidden rounded-lg border bg-[#f6f6f6] p-1">
                    <img src={image} alt={`${product.title} image ${idx + 2}`} className="h-full w-full object-contain" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            {category ? <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{category.name}</p> : null}
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{product.title}</h1>
            <p className="text-sm leading-6 text-slate-600">{product.short_description || "No short description available."}</p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Lowest active offer</p>
              {lowestOffer ? <p className="mt-1 text-3xl font-bold">{lowestOffer.price} {lowestOffer.currency}</p> : <p className="mt-1 text-sm text-slate-500">No active offers available right now.</p>}
            </div>
          </div>
        </article>

        <section className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold">Description</h2>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{product.long_description || product.description || "Detailed description is not available yet."}</div>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Specifications</h2>
              {sortedGroups.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {sortedGroups.map((group) => (
                    <div key={group.groupName} className="rounded-xl border border-slate-200">
                      <div className="border-b bg-slate-50 px-4 py-2 text-sm font-semibold">{group.groupName}</div>
                      <dl className="divide-y">
                        {group.items.map((item) => (
                          <div key={item.key} className="grid grid-cols-1 gap-2 px-4 py-3 text-sm sm:grid-cols-2">
                            <dt className="text-slate-600">{item.name}</dt>
                            <dd className="font-medium text-slate-900">{item.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No specifications are available for this product yet.</p>
              )}
            </section>
          </div>

          <aside>
            <h2 className="text-xl font-semibold">Merchant offers</h2>
            {offers.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-xl border">
                <table className="min-w-full divide-y text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 font-medium">Merchant</th>
                      <th className="px-3 py-2 font-medium">Price</th>
                      <th className="px-3 py-2 font-medium">Stock</th>
                      <th className="px-3 py-2 font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {offers.map((offer, index) => {
                      const merchant = extractSingle(offer.merchants);
                      return (
                        <tr key={offer.id} className={index === 0 ? "bg-emerald-50/60" : ""}>
                          <td className="px-3 py-3">
                            <p className="font-medium">{merchant?.name ?? "Unknown merchant"}</p>
                            {offer.product_url ? <a href={offer.product_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Buy link</a> : <p className="text-xs text-slate-400">No buy link</p>}
                          </td>
                          <td className="px-3 py-3 font-semibold">{offer.price} {offer.currency}</td>
                          <td className="px-3 py-3 text-slate-600">{stockLabel(offer.stock_status)}</td>
                          <td className="px-3 py-3 text-slate-500">{new Date(offer.updated_at).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No active offers yet.</p>
            )}
          </aside>
        </section>
      </section>
    </main>
  );
}
