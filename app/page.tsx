import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "BestPrice Armenia | Compare Products & Merchant Offers",
  description: "Compare products and merchant offers in one place.",
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
        .select("id,name,slug,image_url")
        .eq("status", "active")
        .order("name");

      categories = categoriesData ?? [];
    } catch (error) {
      console.error("Failed to load homepage categories from Supabase", error);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <PublicHeader userEmail={user?.email ?? null} />

      <section className="w-full px-4 py-8 sm:px-6 lg:px-10">
        <h1 className="text-2xl font-semibold tracking-tight">Popular Categories</h1>
        {categories.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {categories.map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`} className="group rounded-xl border border-slate-200 bg-white p-2 transition hover:border-slate-300 hover:shadow-sm">
                <div className="aspect-[4/3] w-full rounded-lg bg-slate-800/95 p-3">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-md border border-slate-700 text-xs text-slate-300">
                      No image
                    </div>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-900">{category.name}</p>
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
