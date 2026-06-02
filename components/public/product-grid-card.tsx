import Link from "next/link";
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
    <Link href={`/products/${product.slug}`} className={`group block transition ${widthClassName ?? ""}`.trim()}>
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
        <div className="aspect-square bg-slate-50 p-5">
          {image ? (
            <img src={String(image)} alt={product.title} className="h-full w-full object-contain object-center mix-blend-multiply transition duration-300 group-hover:scale-[1.03]" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-400">Նկար չկա</div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-950">{product.title}</h3>
          <div className="mt-auto pt-3">
            {lowestPriceAMD !== null && lowestPriceAMD !== undefined ? <p className="text-xl font-semibold leading-6 tracking-tight text-slate-950"><PriceText amountAMD={lowestPriceAMD} /></p> : <p className="text-xl font-semibold leading-6 text-slate-300">—</p>}
          </div>
          <p className="mt-1 text-xs font-medium leading-4 text-slate-500">{offerText}</p>
        </div>
      </article>
    </Link>
  );
}
