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
      className="group rounded-2xl border border-slate-100 bg-slate-50 p-3 transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-slate-950/5"
    >
      <div className="aspect-[4/3] w-full rounded-xl bg-white p-3 ring-1 ring-slate-100 transition group-hover:ring-blue-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-contain mix-blend-multiply contrast-108 brightness-102"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
            No image
          </div>
        )}
      </div>
      <p className="mt-3 line-clamp-2 text-center text-sm font-bold text-slate-900 transition group-hover:text-blue-700">{name}</p>
    </Link>
  );
}
