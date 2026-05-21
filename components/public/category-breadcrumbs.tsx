import Link from "next/link";
import type { Route } from "next";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function CategoryBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-600">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href as Route} className="max-w-[180px] truncate hover:underline sm:max-w-none">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "max-w-[220px] truncate font-medium text-slate-900 sm:max-w-none" : "max-w-[180px] truncate sm:max-w-none"}>
                  {item.label}
                </span>
              )}
              {!isLast ? <span aria-hidden="true" className="text-slate-400">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function breadcrumbJsonLd(items: Array<{ label: string; href: string }>, siteUrl?: string) {
  const base = siteUrl?.replace(/\/$/, "") || "";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${base}${item.href}`,
    })),
  };
}
