import { PriceText } from "@/components/public/price-text";

type MerchantOfferCardProps = {
  merchantName: string;
  merchantLogoUrl?: string | null;
  merchantInitials: string;
  price: number;
  productUrl?: string | null;
  isBestOffer?: boolean;
};

export function MerchantOfferCard({ merchantName, merchantLogoUrl, merchantInitials, price, productUrl, isBestOffer = false }: MerchantOfferCardProps) {
  return (
    <article
      className={`group rounded-2xl border bg-white px-4 py-3.5 transition-all duration-200 sm:px-5 ${
        isBestOffer
          ? "border-emerald-200 shadow-[0_1px_0_rgba(16,185,129,0.18)] hover:border-emerald-300"
          : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      }`}
    >
      <div className="flex min-h-[80px] flex-col gap-3 sm:grid sm:grid-cols-[64px_minmax(0,1fr)_minmax(180px,220px)_170px] sm:items-center sm:gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-2">
          {merchantLogoUrl ? <img src={merchantLogoUrl} alt={`${merchantName} logo`} className="h-full w-full object-contain object-center" /> : <span className="text-xs font-semibold text-slate-600">{merchantInitials}</span>}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-semibold text-slate-900">{merchantName}</p>
            {isBestOffer ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Լավագույն առաջարկ</span> : null}
          </div>
        </div>

        <div className="sm:justify-self-end">
          <p className="text-[31px] font-extrabold leading-none tracking-tight text-slate-950"><PriceText amountAMD={price} /></p>
        </div>

        <div className="sm:justify-self-end">
          {productUrl ? <a href={productUrl} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-slate-800 sm:w-[170px]">Տեսնել առաջարկը</a> : null}
        </div>
      </div>
    </article>
  );
}
