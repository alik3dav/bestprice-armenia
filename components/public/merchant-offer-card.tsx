import { PriceText } from "@/components/public/price-text";

type MerchantOfferCardProps = {
  merchantName: string;
  merchantSlug?: string | null;
  merchantLogoUrl?: string | null;
  merchantInitials: string;
  price: number;
  productUrl?: string | null;
};

export function MerchantOfferCard({ merchantName, merchantSlug, merchantLogoUrl, merchantInitials, price, productUrl }: MerchantOfferCardProps) {
  return (
    <article className="group rounded-2xl bg-slate-50/90 px-3.5 py-3 transition duration-200 hover:bg-white hover:shadow-sm sm:px-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-2">
          {merchantLogoUrl ? <img src={merchantLogoUrl} alt={`${merchantName} logo`} className="h-full w-full object-contain object-center" /> : <span className="text-xs font-semibold text-slate-600">{merchantInitials}</span>}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-slate-900">{merchantName}</p>
          {merchantSlug ? <p className="mt-0.5 text-xs text-slate-500">{merchantSlug}</p> : null}
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <p className="text-2xl font-bold leading-none text-slate-950 sm:text-[30px]"><PriceText amountAMD={price} /></p>
          {productUrl ? <a href={productUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition duration-200 hover:bg-slate-800 sm:text-sm">Տեսնել առաջարկը</a> : <span className="text-xs text-slate-400">N/A</span>}
        </div>
      </div>
    </article>
  );
}
