import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "BestPrice Armenia | Compare Products & Merchant Offers",
  description:
    "Compare products and merchant offers in one place. Find the latest deals, check categories, and pick the best price faster.",
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: products }, { data: offers }, { data: categories }] = await Promise.all([
    supabase.from("products").select("id,title,slug,created_at").eq("status", "active").order("created_at", { ascending: false }).limit(6),
    supabase
      .from("product_offers")
      .select("id,price,currency,stock_status,products!inner(title,slug)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("categories").select("id,name,slug").eq("status", "active").order("name").limit(8),
  ]);

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
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#latest" className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white">Browse products & offers</a>
            <a href="#" className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700">Login / Sign up</a>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">How it works</h2>
          <ol className="mt-3 space-y-3 text-sm text-slate-700">
            <li>1. Explore active products by category.</li>
            <li>2. Compare live offers from multiple merchants.</li>
            <li>3. Pick the best value based on price, stock, and delivery info.</li>
          </ol>
        </div>
      </section>

      <section id="latest" className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">Latest active products</h2>
        {products && products.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="rounded-xl border border-slate-200 p-4">
                <h3 className="font-medium">{product.title}</h3>
                <p className="mt-1 text-xs text-slate-500">/{product.slug}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No active products yet.</p>
        )}
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">Recent offers</h2>
        {offers && offers.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <article key={offer.id} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">{(Array.isArray(offer.products) ? offer.products[0]?.title : (offer.products as { title?: string } | null)?.title) ?? "Product"}</p>
                <p className="text-lg font-semibold">{offer.price} {offer.currency}</p>
                <p className="text-xs text-slate-500">{offer.stock_status.replace("_", " ")}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No active offers yet.</p>
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
