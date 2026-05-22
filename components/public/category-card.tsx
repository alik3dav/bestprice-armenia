import Link from "next/link";

type CategoryCardProps = {
  name: string;
  href: string;
  imageUrl?: string | null;
};

export function CategoryCard({ name, href, imageUrl }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-xl bg-[#f6f6f6] p-2 transition hover:bg-slate-100"
    >
      <div className="aspect-[4/3] w-full rounded-lg p-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-contain mix-blend-multiply contrast-108 brightness-102"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-md border border-slate-200 bg-white text-xs text-slate-400">
            No image
          </div>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-center text-sm font-medium text-slate-900">{name}</p>
    </Link>
  );
}
