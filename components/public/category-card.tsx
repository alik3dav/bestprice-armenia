import Link from "next/link";
import type { ComponentProps } from "react";

type CategoryCardProps = {
  name: string;
  href: ComponentProps<typeof Link>["href"];
  imageUrl?: string | null;
};

export function CategoryCard({ name, href, imageUrl }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-md bg-[var(--color-page-bg)] p-2 transition hover:bg-white"
    >
      <div className="aspect-[4/3] w-full rounded bg-white p-3 transition">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-contain mix-blend-multiply contrast-108 brightness-102"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded bg-[var(--color-page-bg)] text-xs text-[var(--color-text-muted)]">
            No image
          </div>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-center text-sm font-semibold leading-5 text-[var(--color-text-primary)] transition group-hover:text-[var(--color-brand-red)]">{name}</p>
    </Link>
  );
}
