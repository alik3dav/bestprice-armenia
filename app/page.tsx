import type { Metadata, Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, BadgeCheck, BarChart3, Search, ShieldCheck, Store, TrendingDown } from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { LatestProductsSection, LatestProductsSkeleton } from "@/components/public/latest-products-section";
import { CategoryCard } from "@/components/public/category-card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "BestPrice Armenia | Ապրանքների և առաջարկների համեմատում",
  description: "Համեմատեք ապրանքներն ու վաճառողների առաջարկները մեկ վայրում։",
};

const popularSearches = ["iPhone", "Laptop", "TV", "Սառնարան"];

const heroStats = [
  { value: "100+", label: "կատեգորիա" },
  { value: "24/7", label: "գների դիտարկում" },
  { value: "1", label: "մաքուր համեմատություն" },
];

const valueCards = [
  {
    icon: TrendingDown,
    title: "Գների պարզ համեմատում",
    description: "Տեսեք ամենացածր գինը, խանութը և հասանելիությունը առանց ավելորդ աղմուկի։",
  },
  {
    icon: ShieldCheck,
    title: "Ընթեռնելի տվյալներ",
    description: "Ապրանքի կարևոր բնութագրերը և առաջարկները դասավորված են կոմպակտ քարտերում։",
  },
  {
    icon: Store,
    title: "Խանութները մեկ էջում",
    description: "Համեմատեք նույն ապրանքի առաջարկները տարբեր վաճառողներից նույն հոսքում։",
  },
];

const steps = [
  { icon: Search, title: "Որոնեք", description: "Գրեք ապրանքի անունը կամ բացեք կատեգորիաները։" },
  { icon: BarChart3, title: "Համեմատեք", description: "Տեսեք գինը, առկայությունը և հիմնական տարբերությունները։" },
  { icon: BadgeCheck, title: "Ընտրեք", description: "Անցեք խանութ և ավարտեք գնումը վստահությամբ։" },
];

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export default async function HomePage() {
  let user: { email?: string | null } | null = null;
  let categories: { id: string; name: string; slug: string; image_url: string | null }[] = [];

  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient();
      const authResult = await supabase.auth.getUser();
      user = authResult.data.user;

      const { data: categoriesData } = await supabase
        .from("categories")
        .select("id,name,slug,image_url,parent_id")
        .eq("status", "active")
        .order("name");

      categories = (categoriesData ?? []).filter((c: any) => Boolean(c.parent_id));
    } catch (error) {
      console.error("Failed to load homepage categories from Supabase", error);
    }
  }

  const featuredCategories = categories.slice(0, 10);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <PublicHeader userEmail={user?.email ?? null} />

      <section className="border-b border-slate-200/80 bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              BestPrice Armenia
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
              Գտեք լավագույն գինը՝ մաքուր և արագ։
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              SaaS ոճի պարզ վահանակ՝ ապրանքները, գները, խանութները և հիմնական տվյալները մեկ կոմպակտ էջում համեմատելու համար։
            </p>

            <form action="/search" className="mt-7 flex max-w-2xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row">
              <label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4 text-slate-500">
                <Search className="h-4 w-4" />
                <span className="sr-only">Որոնել ապրանք</span>
                <input name="q" type="search" placeholder="Որոնել ապրանք, բրենդ կամ կատեգորիա" className="w-full bg-transparent text-sm font-medium text-slate-950 placeholder:text-slate-400 focus:outline-none" />
              </label>
              <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800" type="submit">
                Որոնել
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-slate-500">Հաճախ փնտրում են</span>
              {popularSearches.map((search) => (
                <Link key={search} href={`/search?q=${encodeURIComponent(search)}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                  {search}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 text-white shadow-xl shadow-slate-950/10">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Կարճ ակնարկ</p>
              <div className="mt-5 grid gap-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between rounded-2xl bg-white p-4 text-slate-950">
                    <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                    <span className="text-2xl font-semibold tracking-tight">{stat.value}</span>
                  </div>
                ))}
              </div>
              <Link href="/shop" className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white/10 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/15">
                Դիտել ապրանքները
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
          {valueCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Կատեգորիաներ</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Սկսեք ճիշտ բաժնից</h2>
            </div>
            <div className="flex gap-2">
              <Link href="/categories" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Բոլորը
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/shop" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                Խանութ
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {featuredCategories.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {featuredCategories.map((category) => (
                <CategoryCard key={category.id} name={category.name} href={`/categories/${category.slug}` as Route} imageUrl={category.image_url} />
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-medium text-slate-500">Ակտիվ կատեգորիաներ դեռ չկան։</p>
          )}
        </div>
      </section>

      <Suspense fallback={<LatestProductsSkeleton />}>
        <LatestProductsSection />
      </Suspense>

      <section className="px-4 pb-12 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-3 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-400">0{index + 1}</span>
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
