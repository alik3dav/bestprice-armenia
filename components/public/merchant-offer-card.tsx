import { ArrowUpRight, CheckCircle2, Clock3, ShieldCheck, Store } from "lucide-react";
import { PriceText } from "@/components/public/price-text";

type MerchantOfferCardProps = {
  merchantName: string;
  merchantLogoUrl?: string | null;
  merchantInitials: string;
  price: number;
  productUrl?: string | null;
  isBestOffer?: boolean;
  stockStatus?: "in_stock" | "limited" | "out_of_stock" | "preorder";
  updatedAt?: string | null;
  rank?: number;
};

const STOCK_LABELS: Record<NonNullable<MerchantOfferCardProps["stockStatus"]>, string> = {
  in_stock: "Առկա է",
  limited: "Քիչ քանակ",
  out_of_stock: "Առկա չէ",
  preorder: "Նախապատվեր",
};

function formatUpdatedAt(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("hy-AM", { day: "2-digit", month: "short" }).format(date);
}

export function MerchantOfferCard({
  merchantName,
  merchantLogoUrl,
  merchantInitials,
  price,
  productUrl,
  isBestOffer = false,
  stockStatus = "in_stock",
  updatedAt,
  rank,
}: MerchantOfferCardProps) {
  const updatedLabel = formatUpdatedAt(updatedAt);
  const isUnavailable = stockStatus === "out_of_stock";

  return (
    <article
      className={`group relative overflow-hidden rounded-lg border bg-white px-3 py-3 shadow-[var(--shadow-subtle)] transition sm:px-4 ${
        isBestOffer
          ? "border-[var(--color-brand-red)] ring-1 ring-red-100"
          : "border-[var(--color-border)] hover:border-slate-300"
      }`}
    >
      {isBestOffer ? <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[var(--color-brand-red)]" /> : null}
      <div className="grid gap-3 md:grid-cols-[48px_minmax(0,1fr)_minmax(130px,170px)] md:items-center lg:grid-cols-[48px_minmax(0,1fr)_minmax(130px,160px)_132px]">
        <div className="flex items-center gap-3 md:block">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-slate-50 p-2">
            {merchantLogoUrl ? <img src={merchantLogoUrl} alt={`${merchantName} logo`} className="h-full w-full object-contain object-center" /> : <span className="text-sm font-semibold tracking-tight text-slate-700">{merchantInitials}</span>}
          </div>
          {rank ? <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500 md:mt-2">#{rank}</span> : null}
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-base font-semibold text-slate-950">{merchantName}</p>
            {isBestOffer ? <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-[var(--color-brand-red)] ring-1 ring-red-100"><ShieldCheck className="h-3.5 w-3.5" /> Լավագույն գին</span> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ring-1 ${isUnavailable ? "bg-rose-50 text-rose-700 ring-rose-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"}`}>
              <CheckCircle2 className="h-3.5 w-3.5" /> {STOCK_LABELS[stockStatus]}
            </span>
            {updatedLabel ? <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-slate-600 ring-1 ring-slate-100"><Clock3 className="h-3.5 w-3.5" /> Թարմացվել է {updatedLabel}</span> : null}
          </div>
        </div>

        <div className="rounded-md bg-slate-50 px-3 py-2 md:justify-self-end md:bg-transparent md:px-0 md:py-0 md:text-right">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-slate-400">Գին</p>
          <p className="mt-1 text-xl font-bold leading-none tracking-tight text-slate-950"><PriceText amountAMD={price} /></p>
        </div>

        <div className="md:col-span-3 lg:col-span-1 lg:justify-self-end">
          {productUrl ? (
            <a
              href={productUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--color-brand-red)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-red-hover)] focus:outline-none focus:ring-2 focus:ring-red-200 lg:w-[132px]"
            >
              Տեսնել <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : (
            <div className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm font-semibold text-slate-500 lg:w-[132px]"><Store className="h-4 w-4" /> Հղում չկա</div>
          )}
        </div>
      </div>
    </article>
  );
}
