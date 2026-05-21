import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { FooterLoginButton } from "@/components/public/footer-login-button";

const hasSupabaseEnv = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function FooterCategoryLinks() {
  if (!hasSupabaseEnv()) {
    return <p className="text-sm text-slate-500">Կատեգորիաներ հասանելի չեն։</p>;
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("id,name,slug,parent_id")
      .eq("status", "active")
      .order("name")
      .limit(8);

    const categories = (data ?? []).filter((category: any) => !category.parent_id);

    if (!categories.length) {
      return <p className="text-sm text-slate-500">Կատեգորիաներ դեռ չկան։</p>;
    }

    return (
      <ul className="mt-3 space-y-2">
        {categories.map((category: any) => (
          <li key={category.id}>
            <Link href={`/categories/${category.slug}`} className="text-sm text-slate-600 transition hover:text-slate-900">
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    );
  } catch {
    return <p className="text-sm text-slate-500">Կատեգորիաները բեռնել չհաջողվեց։</p>;
  }
}

function FooterCategoryLinksFallback() {
  return <p className="mt-3 text-sm text-slate-500">Բեռնվում է...</p>;
}

export function PublicFooter() {
  return (
    <footer className="mt-10 w-full border-t border-slate-200/80 bg-white">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">BestPrice</Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-600">Հայկական հարթակ՝ ապրանքներն ու առաջարկները արագ համեմատելու համար։</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Նավիգացիա</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/" className="text-sm text-slate-600 transition hover:text-slate-900">Գլխավոր</Link></li>
              <li><Link href="/" className="text-sm text-slate-600 transition hover:text-slate-900">Կատեգորիաներ</Link></li>
              <li><Link href="/#latest-products" className="text-sm text-slate-600 transition hover:text-slate-900">Վերջին ապրանքներ</Link></li>
              <li><FooterLoginButton /></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Կատեգորիաներ</h3>
            <Suspense fallback={<FooterCategoryLinksFallback />}>
              <FooterCategoryLinks />
            </Suspense>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Իրավական</h3>
            <ul className="mt-3 space-y-2">
              <li><a href="#" className="text-sm text-slate-600 transition hover:text-slate-900">Գաղտնիության քաղաքականություն</a></li>
              <li><a href="#" className="text-sm text-slate-600 transition hover:text-slate-900">Օգտագործման պայմաններ</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-xs text-slate-500">© {new Date().getFullYear()} BestPrice. Բոլոր իրավունքները պաշտպանված են։</div>
      </div>
    </footer>
  );
}
