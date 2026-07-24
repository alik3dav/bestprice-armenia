import Link from "next/link";
import { Flame } from "lucide-react";
import type { ComponentProps } from "react";
import { HomeSectionHeading } from "@/components/public/home-section-heading";

type HomeCategory = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

type HomeCategoryStripProps = {
  categories: HomeCategory[];
};

export function HomeCategoryStrip({ categories }: HomeCategoryStripProps) {
  return (
    <section className="px-3 py-6 sm:px-5 sm:py-8 lg:px-6" aria-labelledby="popular-categories-heading">
      <div className="mx-auto max-w-[1200px]">
        <HomeSectionHeading
          id="popular-categories-heading"
          title="Հանրամատչելի կատեգորիաներ"
          icon={<Flame className="h-5 w-5 text-[var(--color-brand-red)]" aria-hidden="true" />}
          action={{ label: "Բոլորը", href: "/categories" }}
        />

        {categories.length ? (
          <nav aria-label="Հանրամատչելի կատեգորիաներ" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map((category) => (
              <HomeCategoryTile key={category.id} category={category} />
            ))}
          </nav>
        ) : (
          <p className="mt-5 rounded-md bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-muted)]">Կատեգորիաներ դեռ հասանելի չեն։</p>
        )}
      </div>
    </section>
  );
}

function HomeCategoryTile({ category }: { category: HomeCategory }) {
  return (
    <Link
      href={`/categories/${category.slug}` as ComponentProps<typeof Link>["href"]}
      className="group flex min-h-[132px] flex-col items-center justify-center rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-surface)] p-3 text-center shadow-[var(--shadow-subtle)] transition hover:border-[var(--color-border)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)] focus-visible:ring-offset-2"
    >
      <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[var(--color-page-bg)] p-2">
        {category.image_url ? (
          <img src={category.image_url} alt="" className="h-full w-full object-contain mix-blend-multiply" />
        ) : (
          <span className="text-xs font-medium text-[var(--color-text-muted)]">—</span>
        )}
      </span>
      <span className="mt-3 line-clamp-2 text-xs font-semibold leading-4 text-[var(--color-text-primary)] transition group-hover:text-[var(--color-action-blue)]">{category.name}</span>
    </Link>
  );
}
