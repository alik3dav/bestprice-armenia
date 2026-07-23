import Link from "next/link";
import { Store } from "lucide-react";
import { PriceText } from "@/components/public/price-text";

type ProductGridCardProps = {
  product: {
    slug: string;
    title: string;
    images?: unknown;
  };
  lowestPriceAMD?: number | null;
  activeOfferCount?: number;
  widthClassName?: string;
};

export function ProductGridCard({ product, lowestPriceAMD, activeOfferCount = 0, widthClassName }: ProductGridCardProps) {
  const image = Array.isArray(product.images) ? product.images[0] : null;
  const offerText = activeOfferCount <= 0 ? "Առաջարկներ չկան" : activeOfferCount === 1 ? "1 խանութում" : `${activeOfferCount} խանութներում`;

  return (
    <article className={`group flex h-full min-h-[360px] flex-col rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-subtle)] transition hover:border-[var(--color-border)] hover:shadow-md ${widthClassName ?? ""}`.trim()}>
      <Link href={`/products/${product.slug}`} className="block aspect-square shrink-0 overflow-hidden rounded-md bg-[var(--color-page-bg)] p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)] focus-visible:ring-offset-2">
        {image ? (
          <img src={String(image)} alt={product.title} className="h-full w-full object-contain object-center mix-blend-multiply transition duration-200 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-[var(--color-text-muted)]">Նկար չկա</div>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <Link href={`/products/${product.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)] focus-visible:ring-offset-2">
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[var(--color-text-primary)] transition group-hover:text-[var(--color-action-blue)]">{product.title}</h3>
        </Link>
        <p className="mt-2 text-xs leading-4 text-[var(--color-text-muted)]">Գնահատական չկա</p>
        <div className="mt-auto pt-3">
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">Սկսած</p>
          {lowestPriceAMD !== null && lowestPriceAMD !== undefined ? <p className="mt-1 text-xl font-bold leading-6 tracking-tight text-[var(--color-price-text)]"><PriceText amountAMD={lowestPriceAMD} /></p> : <p className="mt-1 text-xl font-bold leading-6 text-[var(--color-text-muted)]">—</p>}
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium leading-4 text-[var(--color-text-secondary)]"><Store className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{offerText}</p>
        </div>
        <Link href={`/products/${product.slug}`} className="mt-3 inline-flex min-h-10 items-center justify-center rounded-md bg-[var(--color-action-blue)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-action-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)] focus-visible:ring-offset-2">
          Տեսնել առաջարկները
        </Link>
      </div>
    </article>
  );
}
