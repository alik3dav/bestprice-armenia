"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Sparkles, Star } from "lucide-react";
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
      <article className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white bg-white/92 p-3 shadow-sm shadow-slate-950/[0.04] transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-950/[0.09]">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/80 to-transparent" />
        <div className="relative aspect-square overflow-hidden rounded-[1.35rem] bg-[radial-gradient(circle_at_50%_22%,#ffffff_0%,#eef6ff_62%,#e2e8f0_100%)] p-5">
          <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-black text-blue-700 shadow-sm ring-1 ring-white/80 backdrop-blur">
            <Sparkles className="h-3 w-3" /> BestPrice
          </div>
          <button
            type="button"
            title="Ավելացնել ընտրյալներում"
            aria-label="Ավելացնել ընտրյալներում"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsFavorite((current) => !current);
            }}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-[0_10px_26px_rgba(15,23,42,0.14)] ring-1 ring-white/80 backdrop-blur transition-all duration-200 hover:scale-105 hover:text-slate-700"
          >
            <Heart className={`h-4 w-4 transition-all duration-200 ${isFavorite ? "scale-110 fill-red-500 text-red-500" : ""}`} />
          </button>
          {image ? (
            <div className="flex h-full w-full items-center justify-center pt-4">
              <img src={String(image)} alt={product.title} className="h-full w-full object-contain object-center mix-blend-multiply drop-shadow-[0_18px_24px_rgba(15,23,42,0.10)] transition duration-300 group-hover:scale-105" />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">Նկար չկա</div>
          )}
        </div>
        <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
          <h3 className="line-clamp-2 min-h-10 text-[15px] font-black leading-5 text-slate-950">{product.title}</h3>
          <div className="mt-2 flex items-center gap-1 text-amber-300">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
          <div className="mt-auto pt-3">
            {lowestPriceAMD !== null && lowestPriceAMD !== undefined ? <p className="text-[22px] font-black leading-6 tracking-tight text-slate-950"><PriceText amountAMD={lowestPriceAMD} /></p> : <p className="text-[22px] font-black leading-6 text-slate-300">—</p>}
          </div>
          <p className="mt-1 text-xs font-bold leading-4 text-slate-500">{offerText}</p>
        </div>
      </article>
    </Link>
  );
}
