import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { createClient } from "@/lib/supabase/server";

type OfferRow = {
  product_id: string;
  price: number;
  currency: string;
};

type SpecValueRow = {
  product_id: string;
  value_text: string | null;
  value_number: number | null;
  value_boolean: boolean | null;
  value_select: string | null;
  spec_template_fields: { name: string } | { name: string }[] | null;
};

export const metadata: Metadata = {
  title: "BestPrice Armenia | Compare Products & Merchant Offers",
  description:
    "Compare products and merchant offers in one place. Find the latest deals, check categories, and pick the best price faster.",
};


function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function formatSpecValue(value: SpecValueRow) {
  if (value.value_number !== null) return String(value.value_number);
  if (value.value_boolean !== null) return value.value_boolean ? "Yes" : "No";
  if (value.value_select) return value.value_select;
  if (!value.value_text) return null;
  const trimmed = value.value_text.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.join(", ");
    } catch {}
  }
  return trimmed;
}

export default async function HomePage() {
  let user: { email?: string | null } | null = null;
  let products: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    images: unknown;
  }[] = [];
  let categories: { id: string; name: string; slug: string }[] = [];
  let offers: OfferRow[] = [];
  let specValues: SpecValueRow[] = [];

  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient();
      const authResult = await supabase.auth.getUser();
      user = authResult.data.user;

      const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
        supabase
          .from("products")
          .select("id,title,slug,created_at,description,images")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(8),
        supabase.from("categories").select("id,name,slug").eq("status", "active").order("name").limit(8),
      ]);

      products = productsData ?? [];
      categories = categoriesData ?? [];

      const productIds = products.map((product) => product.id);

      const [{ data: offersData }, { data: specValuesData }] = await Promise.all([
        productIds.length
          ? supabase
              .from("product_offers")
              .select("product_id,price,currency")
              .eq("status", "active")
              .in("product_id", productIds)
          : Promise.resolve({ data: [] }),
        productIds.length
          ? supabase
              .from("product_specification_values")
              .select("product_id,value_text,value_number,value_boolean,value_select,spec_template_fields(name)")
              .in("product_id", productIds)
          : Promise.resolve({ data: [] }),
      ]);

      offers = (offersData ?? []) as OfferRow[];
      specValues = (specValuesData ?? []) as SpecValueRow[];
    } catch (error) {
      console.error("Failed to load homepage data from Supabase", error);
    }
  }

  const offersByProduct = new Map<string, OfferRow[]>();
  for (const offer of offers) {
    const existing = offersByProduct.get(offer.product_id) ?? [];
    existing.push(offer);
    offersByProduct.set(offer.product_id, existing);
  }

  const specsByProduct = new Map<string, string[]>();
  for (const spec of specValues) {
    const arr = specsByProduct.get(spec.product_id) ?? [];
    if (arr.length >= 2) continue;
    const fieldName = Array.isArray(spec.spec_template_fields) ? spec.spec_template_fields[0]?.name : spec.spec_template_fields?.name;
    const fieldValue = formatSpecValue(spec);
    if (!fieldName || !fieldValue) continue;
    arr.push(`${fieldName}: ${fieldValue}`);
    specsByProduct.set(spec.product_id, arr);
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <PublicHeader userEmail={user?.email ?? null} />

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">Smart price comparison</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Compare products and merchant offers with confidence.</h1>
          <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
            BestPrice helps you discover products, compare merchant offers, and make better buying decisions quickly.
          </p>
        </div>
      </section>

      <section id="latest" className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">Latest active products</h2>
        {products && products.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const productOffers = offersByProduct.get(product.id) ?? [];
              const lowestOffer = productOffers.reduce<OfferRow | null>((lowest, current) => {
                if (!lowest) return current;
                return current.price < lowest.price ? current : lowest;
              }, null);
              const summary = specsByProduct.get(product.id)?.join(" • ") || product.description || "Specifications will appear here when available.";
              const image = Array.isArray(product.images) ? product.images[0] : null;

              return (
                <Link
                  href={`/#${product.slug}`}
                  key={product.id}
                  className="group block rounded-2xl bg-white p-2 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <article>
                    <div className="relative aspect-square rounded-xl bg-[#f6f6f6] p-3">
                      <button
                        type="button"
                        aria-label="Add to wishlist"
                        className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm"
                        onClick={(event) => event.preventDefault()}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                          <path d="M12 20s-6.8-4.35-9.33-8.03C.45 8.76 2.07 4.5 6.08 4.5c2.2 0 3.47 1.2 3.92 2.2.45-1 1.73-2.2 3.92-2.2 4.01 0 5.63 4.26 3.41 7.47C18.8 15.65 12 20 12 20z" />
                        </svg>
                      </button>
                      {image ? (
                        <img src={image} alt={product.title} className="h-full w-full object-contain" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">No image</div>
                      )}
                    </div>

                    <div className="space-y-1 px-1 pb-1 pt-3">
                      <h3 className="line-clamp-2 text-[15px] font-bold leading-5 text-black">{product.title}</h3>
                      <p className="line-clamp-2 text-[13px] leading-5 text-slate-500">{summary}</p>
                      <div className="pt-1">
                        {lowestOffer ? (
                          <>
                            <p className="text-[20px] font-bold leading-6 text-black">{lowestOffer.price} {lowestOffer.currency}</p>
                            <p className="text-xs text-slate-500">Installment options available at checkout</p>
                          </>
                        ) : (
                          <>
                            <p className="text-[20px] font-bold leading-6 text-slate-300">—</p>
                            <p className="text-xs text-slate-400">No active offers yet</p>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No active products yet.</p>
        )}
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">Categories</h2>
        {categories && categories.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link key={category.id} href={`/#${category.slug}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700">
                {category.name}
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No active categories yet.</p>
        )}
      </section>
    </main>
  );
}
