import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductGridCard } from "@/components/public/product-grid-card";

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  images: unknown;
};

type OfferRow = {
  product_id: string;
  price: number;
  currency: string;
};

const LATEST_PRODUCTS_LIMIT = 12;
const hasSupabaseEnv = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function LatestProductsSection() {
  if (!hasSupabaseEnv()) {
    return <EmptyState />;
  }

  try {
    const supabase = await createClient();
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id,slug,title,images")
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
    const offerCountByProduct = new Map<string, number>();
    for (const offer of (offersData ?? []) as OfferRow[]) {
      const current = lowestOfferByProduct.get(offer.product_id);
      if (!current || Number(offer.price) < Number(current.price)) {
        lowestOfferByProduct.set(offer.product_id, offer);
      }
      offerCountByProduct.set(offer.product_id, (offerCountByProduct.get(offer.product_id) ?? 0) + 1);
    }

    return (
      <section id="latest-products" className="w-full px-3 pb-5 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-[1200px] rounded-lg bg-white p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-[var(--color-brand-red)]">Նոր տեսականի</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">Վերջին ավելացված ապրանքներ</h2>
            </div>
            <Link href="/shop" className="inline-flex items-center rounded-md bg-[var(--color-page-bg)] px-3 py-2 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:bg-slate-100">
              Տեսնել բոլորը
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-3">
              {products.map((product) => {
                const lowest = lowestOfferByProduct.get(product.id);
                const offerCount = offerCountByProduct.get(product.id) ?? 0;

                return (
                  <ProductGridCard
                    key={product.id}
                    product={product}
                    lowestPriceAMD={lowest ? Number(lowest.price) : null}
                    activeOfferCount={offerCount}
                    widthClassName="w-[200px] shrink-0 sm:w-[220px]"
                  />
                );
              })}
            </div>
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
    <section className="w-full px-3 pb-5 sm:px-5 lg:px-6" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-[1200px] rounded-lg bg-white p-3 sm:p-4">
        <div className="h-7 w-56 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="w-[200px] shrink-0 rounded-md bg-[var(--color-page-bg)] p-2 sm:w-[220px]">
                <div className="aspect-square animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="mt-3 h-6 w-1/2 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="w-full px-3 pb-5 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1200px] rounded-lg bg-white p-3 sm:p-4">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">Վերջին ավելացված ապրանքներ</h2>
        <p className="mt-4 rounded-md bg-[var(--color-page-bg)] p-4 text-sm text-[var(--color-text-muted)]">Ապրանքներ դեռ հասանելի չեն։</p>
      </div>
    </section>
  );
}

function ErrorState() {
  return (
    <section className="w-full px-3 pb-5 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1200px] rounded-lg bg-white p-3 sm:p-4">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">Վերջին ավելացված ապրանքներ</h2>
        <p className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">Չհաջողվեց բեռնել վերջին ապրանքները։</p>
      </div>
    </section>
  );
}
