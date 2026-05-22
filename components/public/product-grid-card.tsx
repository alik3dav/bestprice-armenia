import Link from "next/link";
import { PriceText } from "@/components/public/price-text";

type ProductGridCardProps = {
  product: {
    slug: string;
    title: string;
    short_description?: string | null;
    description?: string | null;
    images?: unknown;
  };
  lowestPriceAMD?: number | null;
};

export function ProductGridCard({ product, lowestPriceAMD }: ProductGridCardProps) {
  const image = Array.isArray(product.images) ? product.images[0] : null;

  return (
    <Link href={`/products/${product.slug}`} className="group block p-2 transition">
      <article>
        <div className="relative aspect-square rounded-xl bg-[#f6f6f6] p-3">
          {image ? <img src={String(image)} alt={product.title} className="h-full w-full object-contain mix-blend-multiply contrast-108 brightness-102" /> : <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">No image</div>}
        </div>
        <div className="space-y-1 px-1 pb-1 pt-3">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-5 text-black">{product.title}</h3>
          <p className="line-clamp-2 text-[13px] leading-5 text-slate-500">{product.short_description || product.description || "No short description available."}</p>
          <div className="pt-1">{lowestPriceAMD !== null && lowestPriceAMD !== undefined ? <p className="text-[20px] font-bold leading-6 text-black"><PriceText amountAMD={lowestPriceAMD} /></p> : <p className="text-[20px] font-bold leading-6 text-slate-300">—</p>}</div>
        </div>
      </article>
    </Link>
  );
}
