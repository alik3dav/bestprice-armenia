import type { Metadata } from "next";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { ProductGridCard } from "@/components/public/product-grid-card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Որոնում | BestPrice Armenia",
  description: "Որոնեք ապրանքներ անունով, կատեգորիայով և նկարագրությամբ։",
};

const hasSupabaseEnv = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const query = ((await searchParams)?.q ?? "").trim();

  if (!hasSupabaseEnv()) {
    return <main className="min-h-screen bg-white text-slate-900"><PublicHeader userEmail={null} /><section className="w-full px-4 py-8 sm:px-6 lg:px-10">Supabase not configured.</section><PublicFooter /></main>;
  }

  const supabase = await createClient();
  const authResult = await supabase.auth.getUser();
  const userEmail = authResult.data.user?.email ?? null;

  if (!query) {
    return <main className="min-h-screen bg-white text-slate-900"><PublicHeader userEmail={userEmail} /><section className="w-full px-4 py-8 sm:px-6 lg:px-10"><h1 className="text-2xl font-semibold">Որոնման արդյունքներ</h1><p className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">Մուտքագրեք որոնման բառը վերևի դաշտում։</p></section><PublicFooter /></main>;
  }

  const searchPattern = `%${query}%`;
  const [{ data: categoriesData }, { data: productsData, error: productsError }] = await Promise.all([
    supabase.from("categories").select("id,name").ilike("name", searchPattern).eq("status", "active"),
    supabase
      .from("products")
      .select("id,title,slug,description,short_description,images,status")
      .eq("status", "active")
      .or(`title.ilike.${searchPattern},short_description.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .order("created_at", { ascending: false })
      .limit(120),
  ]);

  const categoryIds = (categoriesData ?? []).map((c) => c.id);
  type SearchProduct = { id: string; title: string; slug: string; description: string | null; short_description: string | null; images: unknown; status: string }
  let categoryProducts: SearchProduct[] = [];

  if (categoryIds.length) {
    const { data } = await supabase
      .from("products")
      .select("id,title,slug,description,short_description,images,status")
      .eq("status", "active")
      .in("category_id", categoryIds)
      .order("created_at", { ascending: false })
      .limit(120);
    categoryProducts = data ?? [];
  }

  const mergedProducts = [...((productsData ?? []) as SearchProduct[]), ...categoryProducts].reduce((acc, product) => {
    if (!acc.find((existing) => existing.id === product.id)) acc.push(product);
    return acc;
  }, [] as SearchProduct[]);

  const productIds = mergedProducts.map((p) => p.id);
  const { data: offersData, error: offersError } = productIds.length
    ? await supabase.from("product_offers").select("product_id,price,status").in("product_id", productIds).eq("status", "active")
    : { data: [], error: null };

  const offersByProduct = new Map<string, { product_id: string; price: number }[]>();
  for (const offer of offersData ?? []) {
    offersByProduct.set(offer.product_id, [...(offersByProduct.get(offer.product_id) ?? []), offer]);
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <PublicHeader userEmail={userEmail} />
      <section className="w-full px-4 py-8 sm:px-6 lg:px-10">
        <h1 className="text-2xl font-semibold">Որոնման արդյունքներ</h1>
        <p className="mt-1 text-sm text-slate-500">"{query}" — {mergedProducts.length} արդյունք</p>

        {productsError || offersError ? <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Չհաջողվեց բեռնել որոնման արդյունքները։</p> : null}

        {!productsError && mergedProducts.length === 0 ? <p className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">Ձեր որոնմամբ ապրանքներ չգտնվեցին։</p> : null}

        {!productsError && mergedProducts.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {mergedProducts.map((product: SearchProduct) => {
              const offers = offersByProduct.get(product.id) ?? [];
              const lowest = offers.reduce((min, offer) => (min === null || offer.price < min ? offer.price : min), null as number | null);
              return <ProductGridCard key={product.id} product={product} lowestPriceAMD={lowest} activeOfferCount={offers.length} />;
            })}
          </div>
        ) : null}
      </section>
      <PublicFooter />
    </main>
  );
}
