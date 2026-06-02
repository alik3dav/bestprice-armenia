import type { Metadata, Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChevronRight,
  Clock3,
  Flame,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Tags,
  TrendingDown,
} from "lucide-react";
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
    eyebrow: "Խնայեք ժամանակ",
    title: "Գնի արագ համեմատում",
    description: "Տեսեք տարբեր վաճառողների առաջարկները և ընտրեք ամենահարմար տարբերակը առանց երկար որոնման։",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Ստուգված տեսականի",
    title: "Վստահելի առաջարկներ",
    description: "Ակտիվ ապրանքներն ու առաջարկները հավաքված են մեկ հարթակում՝ պարզ և ընթեռնելի տեսքով։",
  },
  {
    icon: Store,
    eyebrow: "Խանութների ցանց",
    title: "Խանութների ընտրություն",
    description: "Համեմատեք նույն ապրանքի հասանելիությունը և գինը տարբեր խանութներում։",
  },
];

const steps = [
  { icon: Search, title: "Որոնեք", description: "Գտեք ապրանքը անունով կամ անցեք կատեգորիաներով։" },
  { icon: BarChart3, title: "Համեմատեք", description: "Ստուգեք գները, առաջարկների քանակը և մանրամասները։" },
  { icon: BadgeCheck, title: "Ընտրեք", description: "Բացեք լավագույն առաջարկը և կապ հաստատեք վաճառողի հետ։" },
];

const spotlightRows = [
  { name: "Սմարթֆոններ", offers: "8 ակտիվ առաջարկ", price: "89,000 ֏", width: "82%" },
  { name: "Համակարգիչներ", offers: "6 ակտիվ առաջարկ", price: "145,000 ֏", width: "68%" },
  { name: "Կենցաղային տեխնիկա", offers: "5 ակտիվ առաջարկ", price: "72,000 ֏", width: "54%" },
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
    <main className="min-h-screen overflow-hidden bg-[#f4f7fb] text-slate-950">
      <PublicHeader userEmail={user?.email ?? null} />

      <section className="relative isolate px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-10 lg:pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(37,99,235,0.24),transparent_32%),radial-gradient(circle_at_84%_12%,rgba(249,115,22,0.22),transparent_28%),linear-gradient(180deg,#ffffff_0%,#eef5ff_54%,#f4f7fb_100%)]" />
        <div className="absolute left-[8%] top-24 -z-10 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-24 right-[7%] -z-10 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />

        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-8 lg:grid-cols-[1.03fr_0.97fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-sm font-bold text-blue-700 shadow-sm shadow-blue-950/5 backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Գտեք լավագույն գինը Հայաստանում
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-7xl">
                Գնման որոշումը դարձրեք արագ, հստակ և շահավետ։
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                BestPrice Armenia-ն միավորում է ապրանքների կատեգորիաները, խանութների առաջարկներն ու գները, որպեսզի մեկ որոնումով տեսնեք ամենահարմար տարբերակը։
              </p>

              <form action="/search" className="mt-8 max-w-3xl rounded-[2rem] border border-white/90 bg-white/90 p-2 shadow-2xl shadow-blue-950/10 backdrop-blur sm:flex sm:items-center sm:gap-2">
                <div className="flex min-h-14 flex-1 items-center gap-3 px-4">
                  <Search className="h-5 w-5 text-blue-600" />
                  <input
                    name="q"
                    placeholder="Որոնել հեռախոս, նոթբուք, հեռուստացույց..."
                    className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400 sm:text-base"
                  />
                </div>
                <button className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700 sm:mt-0 sm:w-auto" type="submit">
                  Որոնել
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-bold text-slate-500">Հաճախ փնտրում են՝</span>
                {popularSearches.map((search) => (
                  <Link
                    key={search}
                    href={`/search?q=${encodeURIComponent(search)}`}
                    className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 font-bold text-slate-700 shadow-sm transition hover:border-blue-100 hover:text-blue-700"
                  >
                    {search}
                  </Link>
                ))}
              </div>

              <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-white/80 bg-white/65 p-4 shadow-sm backdrop-blur">
                    <p className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{stat.value}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-10 hidden rounded-3xl border border-white/70 bg-white/80 p-4 shadow-xl shadow-blue-950/10 backdrop-blur sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Գնի տարբերություն</p>
                    <p className="text-lg font-black text-slate-950">մինչև 18%</p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[2.5rem] border border-white/15 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/25 sm:p-6">
                <div className="rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.42),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))] p-5 ring-1 ring-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white/55">Այսօրվա խելացի ընտրություն</p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Գինը վերահսկող վահանակ</h2>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3 text-orange-200 ring-1 ring-white/10">
                      <Tags className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white p-4 text-slate-950">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                          <Flame className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Թրենդային</p>
                          <p className="font-black">Ամենաշատ դիտվողները</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
                          <Clock3 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/35">Թարմացում</p>
                          <p className="font-black">Արագ դիտարկում</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {spotlightRows.map((item) => (
                      <div key={item.name} className="rounded-3xl bg-white p-4 text-slate-950 shadow-lg shadow-slate-950/10">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black">{item.name}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">{item.offers}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-slate-500">սկսած</p>
                            <p className="text-lg font-black">{item.price}</p>
                          </div>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-orange-400" style={{ width: item.width }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 right-4 hidden rounded-3xl border border-white/70 bg-white/85 p-4 shadow-xl shadow-orange-950/10 backdrop-blur sm:block">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Արագ ուղի</p>
                <Link href="/shop" className="mt-1 inline-flex items-center gap-1 text-sm font-black text-slate-950 transition hover:text-blue-700">
                  Դիտել խանութը
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {valueCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="group relative overflow-hidden rounded-[2rem] border border-white bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-950/10">
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-50 transition group-hover:bg-orange-50" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="relative mt-6 text-xs font-black uppercase tracking-[0.18em] text-blue-600">{card.eyebrow}</p>
                <h2 className="relative mt-2 text-xl font-black tracking-tight text-slate-950">{card.title}</h2>
                <p className="relative mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="w-full px-4 pb-12 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">Կատեգորիաներ</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">Սկսեք գնումը ճիշտ բաժնից</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">Բացեք ամենահարմար բաժինը և համեմատեք նույն տեսակի ապրանքների առաջարկները մեկ էջում։</p>
            </div>
            <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
              <Link href="/categories" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700">
                Բոլոր կատեգորիաները
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/shop" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700">
                Դիտել ապրանքները
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {featuredCategories.length > 0 ? (
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
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
            <p className="mt-7 rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-semibold text-slate-500">Ակտիվ կատեգորիաներ դեռ չկան։</p>
          )}
        </div>
      </section>

      <Suspense fallback={<LatestProductsSkeleton />}>
        <LatestProductsSection />
      </Suspense>

      <section className="px-4 pb-14 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-slate-950 text-white shadow-2xl shadow-slate-950/15">
          <div className="grid gap-8 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.28),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(249,115,22,0.22),transparent_26%)] p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:p-10">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-200">Ինչպես է աշխատում</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] sm:text-4xl">Գնումների պարզ ճանապարհ՝ երեք քայլով</h2>
              <p className="mt-4 text-sm leading-7 text-white/65">Պլանավորեք գնումը, համեմատեք իրական առաջարկները և ընտրեք այն տարբերակը, որը համապատասխանում է ձեր բյուջեին։</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="rounded-[2rem] bg-white/10 p-5 ring-1 ring-white/10 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15">
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
