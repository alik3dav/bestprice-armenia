"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
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
  const [isFavorite, setIsFavorite] = useState(false);
  const image = Array.isArray(product.images) ? product.images[0] : null;

  const offerText = activeOfferCount <= 0 ? "Առաջարկներ չկան" : activeOfferCount === 1 ? "1 խանութում" : `${activeOfferCount} խանութներում`;

  return (
    <Link href={`/products/${product.slug}`} className={`group block p-2 transition ${widthClassName ?? ""}`.trim()}>
      <article className="flex h-full flex-col">
        <div className="relative aspect-square rounded-xl bg-[#f6f6f6] p-3">
          <button
            type="button"
            title="Ավելացնել ընտրյալներում"
            aria-label="Ավելացնել ընտրյալներում"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsFavorite((current) => !current);
            }}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-[0_6px_18px_rgba(15,23,42,0.12)] transition-all duration-200 hover:scale-105 hover:text-slate-700"
          >
            <Heart className={`h-4 w-4 transition-all duration-200 ${isFavorite ? "fill-red-500 text-red-500 scale-110" : ""}`} />
          </button>
          {image ? <img src={String(image)} alt={product.title} className="h-full w-full object-contain mix-blend-multiply contrast-108 brightness-102" /> : <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">No image</div>}
        </div>
        <div className="flex flex-1 flex-col space-y-1 px-1 pb-1 pt-3">
          <h3 className="line-clamp-2 min-h-10 text-[15px] font-bold leading-5 text-black">{product.title}</h3>
          <div className="flex items-center gap-1 text-slate-300">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-3.5 w-3.5" />
            ))}
          </div>
          <div className="pt-1">{lowestPriceAMD !== null && lowestPriceAMD !== undefined ? <p className="text-[20px] font-bold leading-6 text-black"><PriceText amountAMD={lowestPriceAMD} /></p> : <p className="text-[20px] font-bold leading-6 text-slate-300">—</p>}</div>
          <p className="text-xs leading-4 text-slate-500">{offerText}</p>
        </div>
      </article>
    </Link>
  );
}
