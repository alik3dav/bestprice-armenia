import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  images: unknown;
};

type OfferRow = {
  product_id: string;
  price: number;
  currency: string;
};

const LATEST_PRODUCTS_LIMIT = 12;

export async function LatestProductsSection() {
  try {
    const supabase = await createClient();
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id,slug,title,short_description,description,images")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(LATEST_PRODUCTS_LIMIT);

    if (productsError) {
      return <ErrorState />;
    }

    const products = (productsData ?? []) as ProductRow[];

    if (!products.length) {
      return <EmptyState />;
    }

    const productIds = products.map((p) => p.id);
    const { data: offersData } = await supabase
      .from("product_offers")
      .select("product_id,price,currency")
      .eq("status", "active")
      .in("product_id", productIds);

    const lowestOfferByProduct = new Map<string, OfferRow>();
    for (const offer of (offersData ?? []) as OfferRow[]) {
      const current = lowestOfferByProduct.get(offer.product_id);
      if (!current || Number(offer.price) < Number(current.price)) {
        lowestOfferByProduct.set(offer.product_id, offer);
      }
    }

    return (
      <section className="w-full px-4 pb-10 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">Վերջին ավելացված ապրանքներ</h2>
          <Link href="/" className="text-sm font-medium text-slate-600 transition hover:text-slate-900 hover:underline">
            View all
          </Link>
        </div>

        <div className="mt-5 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-4">
            {products.map((product) => {
              const lowest = lowestOfferByProduct.get(product.id);
              const image = Array.isArray(product.images) ? product.images[0] : null;

              return (
                <Link href={`/products/${product.slug}`} key={product.id} className="group block w-[220px] shrink-0 p-2 transition sm:w-[240px]">
                  <article>
                    <div className="relative aspect-square rounded-xl bg-[#f6f6f6] p-3">
                      {typeof image === "string" && image ? (
                        <img
                          src={image}
                          alt={product.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-contain mix-blend-multiply contrast-108 brightness-102"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">Նկար չկա</div>
                      )}
                    </div>
                    <div className="space-y-1 px-1 pb-1 pt-3">
                      <h3 className="line-clamp-2 text-[15px] font-bold leading-5 text-black">{product.title}</h3>
                      <p className="line-clamp-2 text-[13px] leading-5 text-slate-500">{product.short_description || product.description || "Կարճ նկարագրություն հասանելի չէ։"}</p>
                      <div className="pt-1">
                        {lowest ? (
                          <p className="text-[20px] font-bold leading-6 text-black">{lowest.price} {lowest.currency}</p>
                        ) : (
                          <p className="text-[20px] font-bold leading-6 text-slate-300">—</p>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    );
  } catch {
    return <ErrorState />;
  }
}

export function LatestProductsSkeleton() {
  return (
    <section className="w-full px-4 pb-10 sm:px-6 lg:px-10" aria-busy="true" aria-live="polite">
      <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
      <div className="mt-5 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="w-[220px] shrink-0 p-2 sm:w-[240px]">
              <div className="aspect-square animate-pulse rounded-xl bg-slate-200" />
              <div className="mt-3 h-4 w-5/6 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-100" />
              <div className="mt-3 h-6 w-1/2 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="w-full px-4 pb-10 sm:px-6 lg:px-10">
      <h2 className="text-2xl font-semibold tracking-tight">Վերջին ավելացված ապրանքներ</h2>
      <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">Ապրանքներ դեռ հասանելի չեն։</p>
    </section>
  );
}

function ErrorState() {
  return (
    <section className="w-full px-4 pb-10 sm:px-6 lg:px-10">
      <h2 className="text-2xl font-semibold tracking-tight">Վերջին ավելացված ապրանքներ</h2>
      <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">Չհաջողվեց բեռնել վերջին ապրանքները։</p>
    </section>
  );
}
