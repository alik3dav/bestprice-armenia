import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductGridCard } from "@/components/public/product-grid-card";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { createClient } from "@/lib/supabase/server";
import { CategoryBreadcrumbs, breadcrumbJsonLd, type BreadcrumbItem } from "@/components/public/category-breadcrumbs";

export default async function CategoryHierarchyPage({ params }: any) {
  const supabase = await createClient();
  const auth = await supabase.auth.getUser();
  const userEmail = auth.data.user?.email ?? null;
  const segments: string[] = (await params).slug;
  const { data: allCats } = await supabase.from("categories").select("id,name,slug,parent_id,status").eq("status", "active");
  const cats = allCats ?? [];

  let current = cats.find((c) => !c.parent_id && c.slug === segments[0]);
  if (!current) notFound();
  const chain = [current];
  for (const seg of segments.slice(1)) {
    current = cats.find((c) => c.parent_id === current!.id && c.slug === seg);
    if (!current) notFound();
    chain.push(current);
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Գլխավոր", href: "/" },
    { label: "Կատեգորիաներ", href: "/categories" },
    ...chain.map((c, i) => ({ label: c.name, href: `/categories/${chain.slice(0, i + 1).map((x) => x.slug).join("/")}` })),
  ];
  breadcrumbItems[breadcrumbItems.length - 1] = { label: breadcrumbItems[breadcrumbItems.length - 1].label };
  const breadcrumbLd = breadcrumbJsonLd(
    [
      ...breadcrumbItems.filter((i): i is { label: string; href: string } => Boolean(i.href)),
      { label: chain[chain.length - 1].name, href: `/categories/${chain.map((c) => c.slug).join("/")}` },
    ],
    process.env.NEXT_PUBLIC_SITE_URL,
  );

  const children = cats.filter((c) => c.parent_id === current!.id);
  if (children.length) return <main className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]"><PublicHeader userEmail={userEmail} /><section className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-5 lg:px-6"><CategoryBreadcrumbs items={breadcrumbItems} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} /><div className="rounded-lg bg-[var(--color-surface)] p-4 sm:p-5"><p className="text-xs font-semibold text-[var(--color-brand-red)]">Ենթակատեգորիաներ</p><h1 className="mt-1 text-2xl font-semibold leading-tight text-[var(--color-text-primary)]">{current!.name}</h1><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{children.map((child) => <Link key={child.id} href={`/categories/${[...segments, child.slug].join("/")}`} className="group flex min-h-20 items-center justify-between rounded-md border border-[var(--color-border-muted)] bg-[var(--color-surface)] p-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-brand-red)] hover:text-[var(--color-brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)] focus:ring-offset-2"><span className="line-clamp-2">{child.name}</span><span aria-hidden="true" className="ml-2 text-[var(--color-text-muted)] transition group-hover:text-[var(--color-brand-red)]">›</span></Link>)}</div></div></section>      <PublicFooter />
    </main>;

  const { data: products } = await supabase.from("products").select("id,title,slug,images").eq("category_id", current!.id).eq("status", "active");
  const productIds = (products ?? []).map((p) => p.id);
  const { data: offersData } = productIds.length ? await supabase.from("product_offers").select("product_id,price,status").eq("status", "active").in("product_id", productIds) : { data: [] };
  const offersByProduct = new Map<string, { product_id: string; price: number }[]>();
  for (const offer of offersData ?? []) offersByProduct.set(offer.product_id, [...(offersByProduct.get(offer.product_id) ?? []), offer]);

  return <main className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]"><PublicHeader userEmail={userEmail} /><section className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-5 lg:px-6"><CategoryBreadcrumbs items={breadcrumbItems} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} /><div className="mb-4 rounded-lg bg-[var(--color-surface)] p-4 sm:p-5"><p className="text-xs font-semibold text-[var(--color-brand-red)]">Կատեգորիա</p><h1 className="mt-1 text-2xl font-semibold leading-tight text-[var(--color-text-primary)]">{current!.name}</h1><p className="mt-2 text-sm text-[var(--color-text-secondary)]">{products?.length ?? 0} ապրանք՝ նույն չափի նկարներով և համեմատելի քարտերով։</p></div><div className="rounded-lg bg-[var(--color-surface)] p-3 sm:p-4"><div className="grid grid-cols-2 items-stretch gap-3 md:grid-cols-3 xl:grid-cols-5">{(products ?? []).map((p) => { const offers = offersByProduct.get(p.id) ?? []; const lowest = offers.reduce((min, offer) => (min === null || offer.price < min ? offer.price : min), null as number | null); return <ProductGridCard key={p.id} product={p} lowestPriceAMD={lowest} activeOfferCount={offers.length} />; })}</div></div></section>      <PublicFooter />
    </main>;
}
