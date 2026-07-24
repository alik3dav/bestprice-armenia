import type { Metadata, Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, BadgeCheck, BarChart3, Search, ShieldCheck, Store, TrendingDown } from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { LatestProductsSection, LatestProductsSkeleton } from "@/components/public/latest-products-section";
import { CategoryCard } from "@/components/public/category-card";
import { HomePromotionHero } from "@/components/public/home-promotion-hero";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "BestPrice Armenia | Ապրանքների և առաջարկների համեմատում",
  description: "Համեմատեք ապրանքներն ու վաճառողների առաջարկները մեկ վայրում։",
};

const valueCards = [
  {
    icon: TrendingDown,
    title: "Գինը տեսանելի է առաջինը",
    description: "Արագ տեսեք ամենացածր գինը, խանութների քանակը և հիմնական տարբերությունները։",
  },
  {
    icon: ShieldCheck,
    title: "Տվյալները դասավորված են",
    description: "Ապրանքի նկարագրությունը, բնութագրերը և առաջարկները պահվում են պարզ համեմատելի կառուցվածքով։",
  },
  {
    icon: Store,
    title: "Խանութները մեկ հոսքում",
    description: "Համեմատեք նույն ապրանքի ակտիվ առաջարկները տարբեր վաճառողներից՝ առանց էջերը փոխելու։",
  },
];

const steps = [
  { icon: Search, title: "Որոնեք", description: "Գրեք ապրանքի անունը կամ ընտրեք կատեգորիա։" },
  { icon: BarChart3, title: "Համեմատեք", description: "Ստուգեք գինը, հասանելիությունը և վաճառողին։" },
  { icon: BadgeCheck, title: "Ընտրեք", description: "Անցեք խանութ և գնեք վստահությամբ։" },
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
    <main className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]">
      <PublicHeader userEmail={user?.email ?? null} />

      <HomePromotionHero categories={featuredCategories} />

      <section className="px-3 py-5 sm:px-5 lg:px-6">
        <div className="mx-auto grid max-w-[1200px] gap-3 md:grid-cols-3">
          {valueCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="rounded-lg bg-white p-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-page-bg)] text-[var(--color-brand-red)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold leading-5 text-[var(--color-text-primary)]">{card.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{card.description}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-3 pb-5 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-[1200px] rounded-lg bg-white p-3 sm:p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[var(--color-brand-red)]">Կատեգորիաներ</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">Սկսեք ճիշտ բաժնից</h2>
            </div>
            <div className="flex gap-2">
              <Link href="/categories" className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[var(--color-page-bg)] px-3 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:bg-slate-100">
                Բոլորը
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/shop" className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[var(--color-brand-red)] px-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-red-hover)]">
                Խանութ
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {featuredCategories.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {featuredCategories.map((category) => (
                <CategoryCard key={category.id} name={category.name} href={`/categories/${category.slug}` as Route} imageUrl={category.image_url} />
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-md bg-[var(--color-page-bg)] p-4 text-sm font-medium text-[var(--color-text-muted)]">Ակտիվ կատեգորիաներ դեռ չկան։</p>
          )}
        </div>
      </section>

      <Suspense fallback={<LatestProductsSkeleton />}>
        <LatestProductsSection />
      </Suspense>

      <section className="px-3 pb-8 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-[1200px] rounded-lg bg-white p-3 sm:p-4">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[var(--color-brand-red)]">Ինչպես է աշխատում</p>
              <h2 className="mt-1 text-xl font-semibold text-[var(--color-text-primary)]">Գնումը պահեք համեմատելի</h2>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-md bg-[var(--color-page-bg)] p-4">
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-[var(--color-text-secondary)]" />
                    <span className="text-xs font-semibold text-[var(--color-text-muted)]">0{index + 1}</span>
                  </div>
                  <h3 className="mt-3 font-semibold text-[var(--color-text-primary)]">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      <section className="px-3 pb-8 sm:px-5 lg:px-6">
        <div className="mx-auto grid max-w-[1200px] gap-3 rounded-lg bg-[var(--color-surface)] p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-4">
          <div>
            <p className="text-xs font-semibold text-[var(--color-brand-red)]">Վաճառողների համար</p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--color-text-primary)]">Ավելացրեք առաջարկները և հայտնվեք համեմատության մեջ</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">BestPrice Armenia-ի կառուցվածքը պատրաստ է խանութների, ապրանքների և գների պարզ կառավարման համար՝ առանց գնորդների սկանավորումը ծանրացնելու։</p>
          </div>
          <Link href="/merchant/login" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--color-brand-red)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-red-hover)]">
            Մուտք վաճառողի համար
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
