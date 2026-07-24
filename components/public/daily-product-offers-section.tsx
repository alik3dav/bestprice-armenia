import { createClient } from "@/lib/supabase/server";
import { ProductGridCard } from "@/components/public/product-grid-card";
import { HomeSectionHeading } from "@/components/public/home-section-heading";

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  images: unknown;
};

type OfferRow = {
  product_id: string;
  price: number;
};

const DAILY_OFFERS_LIMIT = 5;
const hasSupabaseEnv = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function DailyProductOffersSection() {
  if (!hasSupabaseEnv()) {
    return <DailyOffersState message="Ապրանքներ դեռ հասանելի չեն։" />;
  }

  try {
    const supabase = await createClient();
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id,slug,title,images")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(DAILY_OFFERS_LIMIT);

    if (productsError) {
      return <DailyOffersState message="Չհաջողվեց բեռնել առաջարկները։" />;
    }

    const products = (productsData ?? []) as ProductRow[];
    if (!products.length) {
      return <DailyOffersState message="Ապրանքներ դեռ հասանելի չեն։" />;
    }

    const { data: offersData } = await supabase
      .from("product_offers")
      .select("product_id,price")
      .eq("status", "active")
      .in("product_id", products.map((product) => product.id));

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
      <section className="px-3 pb-8 sm:px-5 sm:pb-10 lg:px-6" aria-labelledby="daily-offers-heading">
        <div className="mx-auto max-w-[1200px]">
          <HomeSectionHeading id="daily-offers-heading" title="Օրվա առաջարկները" description="Համեմատեք նոր ավելացված ապրանքների ակտիվ առաջարկները։" action={{ label: "Բոլորը", href: "/shop" }} />
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {products.map((product) => {
              const lowestOffer = lowestOfferByProduct.get(product.id);
              return <ProductGridCard key={product.id} product={product} lowestPriceAMD={lowestOffer ? Number(lowestOffer.price) : null} activeOfferCount={offerCountByProduct.get(product.id) ?? 0} />;
            })}
          </div>
        </div>
      </section>
    );
  } catch {
    return <DailyOffersState message="Չհաջողվեց բեռնել առաջարկները։" />;
  }
}

export function DailyProductOffersSkeleton() {
  return (
    <section className="px-3 pb-8 sm:px-5 sm:pb-10 lg:px-6" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-[1200px]">
        <div className="h-7 w-56 animate-pulse rounded bg-slate-200" />
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: DAILY_OFFERS_LIMIT }).map((_, index) => (
            <div key={index} className="min-h-[360px] animate-pulse rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-subtle)]">
              <div className="aspect-square rounded-md bg-slate-200" />
              <div className="mt-3 h-10 rounded bg-slate-200" />
              <div className="mt-5 h-6 w-1/2 rounded bg-slate-200" />
              <div className="mt-4 h-10 rounded-md bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DailyOffersState({ message }: { message: string }) {
  return (
    <section className="px-3 pb-8 sm:px-5 sm:pb-10 lg:px-6" aria-labelledby="daily-offers-heading">
      <div className="mx-auto max-w-[1200px]">
        <HomeSectionHeading id="daily-offers-heading" title="Օրվա առաջարկները" action={{ label: "Բոլորը", href: "/shop" }} />
        <p className="mt-5 rounded-md bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-muted)]">{message}</p>
      </div>
    </section>
  );
}
