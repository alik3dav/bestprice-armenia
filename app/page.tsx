import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { DailyProductOffersSection, DailyProductOffersSkeleton } from "@/components/public/daily-product-offers-section";
import { HomeCategoryStrip } from "@/components/public/home-category-strip";
import { HomePromotionHero } from "@/components/public/home-promotion-hero";
import { HomeCommunitySection } from "@/components/public/home-community-section";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "BestPrice Armenia | Ապրանքների և առաջարկների համեմատում",
  description: "Համեմատեք ապրանքներն ու վաճառողների առաջարկները մեկ վայրում։",
};

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

  const featuredCategories = categories.slice(0, 8);
  return (
    <main className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]">
      <PublicHeader userEmail={user?.email ?? null} />

      <HomePromotionHero categories={featuredCategories} />
      <HomeCategoryStrip categories={featuredCategories} />
      <Suspense fallback={<DailyProductOffersSkeleton />}>
        <DailyProductOffersSection />
      </Suspense>
      <HomeCommunitySection />

      <PublicFooter />
    </main>
  );
}
