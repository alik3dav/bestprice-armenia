import type { Metadata, Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, BadgeCheck, BarChart3, Search, ShieldCheck, Sparkles, Store, Tags, TrendingDown } from "lucide-react";
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
  { value: "100+", label: "կատեգորիաներ" },
  { value: "24/7", label: "գների դիտարկում" },
  { value: "1 վայր", label: "բոլոր առաջարկները" },
];

const valueCards = [
  {
    icon: TrendingDown,
    title: "Գնի արագ համեմատում",
    description: "Տեսեք տարբեր վաճառողների առաջարկները և ընտրեք ամենահարմար տարբերակը առանց երկար որոնման։",
  },
  {
    icon: ShieldCheck,
    title: "Վստահելի առաջարկներ",
    description: "Ակտիվ ապրանքներն ու առաջարկները հավաքված են մեկ հարթակում՝ պարզ և ընթեռնելի տեսքով։",
  },
  {
    icon: Store,
    title: "Խանութների ընտրություն",
    description: "Համեմատեք նույն ապրանքի հասանելիությունը և գինը տարբեր խանութներում։",
  },
];

const steps = [
  { icon: Search, title: "Որոնեք", description: "Գտեք ապրանքը անունով կամ անցեք կատեգորիաներով։" },
  { icon: BarChart3, title: "Համեմատեք", description: "Ստուգեք գները, առաջարկների քանակը և մանրամասները։" },
  { icon: BadgeCheck, title: "Ընտրեք", description: "Բացեք լավագույն առաջարկը և կապ հաստատեք վաճառողի հետ։" },
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

  const featuredCategories = categories.slice(0, 12);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8fb] text-slate-950">
      <PublicHeader userEmail={user?.email ?? null} />

      <section className="relative isolate border-b border-white/70 px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(249,115,22,0.18),transparent_30%),linear-gradient(135deg,#ffffff_0%,#eef4ff_48%,#fff7ed_100%)]" />
        <div className="absolute left-1/2 top-8 -z-10 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-sm font-medium text-blue-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Գտեք լավագույն գինը Հայաստանում
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Համեմատեք գները, ընտրեք լավագույն առաջարկը։
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              BestPrice Armenia-ն միավորում է ապրանքների կատեգորիաները, վաճառողների առաջարկներն ու գները, որպեսզի գնումը լինի ավելի արագ, պարզ և շահավետ։
            </p>

            <form action="/search" className="mt-7 flex max-w-2xl flex-col gap-3 rounded-[2rem] border border-white/90 bg-white p-2 shadow-2xl shadow-blue-950/10 sm:flex-row">
              <div className="flex min-h-12 flex-1 items-center gap-3 px-4">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  name="q"
                  placeholder="Որոնել հեռախոս, նոթբուք, հեռուստացույց..."
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 sm:text-base"
                />
              </div>
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700" type="submit">
                Որոնել
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>Հանրաճանաչ՝</span>
              {popularSearches.map((term) => (
                <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className="rounded-full border border-white bg-white/75 px-3 py-1 font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
                  {term}
                </Link>
              ))}
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur">
                  <p className="text-2xl font-black text-slate-950">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-300/40 blur-2xl" />
            <div className="rounded-[2rem] border border-white bg-white/80 p-4 shadow-2xl shadow-slate-950/10 backdrop-blur">
              <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-white/60">Այսօրվա խելացի ընտրություն</p>
                    <h2 className="mt-1 text-2xl font-black">Գինը վերահսկող վահանակ</h2>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Tags className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {["Սմարթֆոններ", "Համակարգիչներ", "Կենցաղային տեխնիկա"].map((item, index) => (
                    <div key={item} className="rounded-2xl bg-white p-4 text-slate-950">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold">{item}</p>
                          <p className="mt-1 text-xs text-slate-500">{index + 3} ակտիվ առաջարկ</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">սկսած</p>
                          <p className="text-lg font-black">{["89,000", "145,000", "72,000"][index]} ֏</p>
                        </div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-orange-400" style={{ width: `${72 - index * 14}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {valueCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="rounded-3xl border border-white bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-lg font-black text-slate-950">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="w-full px-4 pb-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-600">Կատեգորիաներ</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Սկսեք գնումը ճիշտ բաժնից</h2>
            </div>
            <Link href="/categories" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-blue-700">
              Բոլոր կատեգորիաները
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredCategories.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {featuredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  href={`/categories/${category.slug}` as Route}
                  imageUrl={category.image_url}
                />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">Ակտիվ կատեգորիաներ դեռ չկան։</p>
          )}
        </div>
      </section>

      <Suspense fallback={<LatestProductsSkeleton />}>
        <LatestProductsSection />
      </Suspense>

      <section className="px-4 pb-12 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-slate-950 p-6 text-white sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-300">Ինչպես է աշխատում</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Գնումների պարզ ճանապարհ՝ երեք քայլով</h2>
              <p className="mt-4 text-sm leading-7 text-white/65">Պլանավորեք գնումը, համեմատեք իրական առաջարկները և ընտրեք այն տարբերակը, որը համապատասխանում է ձեր բյուջեին։</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
                    <div className="flex items-center justify-between">
                      <Icon className="h-6 w-6 text-blue-200" />
                      <span className="text-sm font-black text-white/30">0{index + 1}</span>
                    </div>
                    <h3 className="mt-5 font-black">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/60">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
