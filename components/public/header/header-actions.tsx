import { Bell, Heart, LogOut, Moon, UserRound } from "lucide-react";
import Link from "next/link";
import { CURRENCY_LABELS, SUPPORTED_DISPLAY_CURRENCIES, type SupportedDisplayCurrency } from "@/lib/money";

type HeaderActionsProps = {
  userEmail: string | null;
  isAccountMenuOpen: boolean;
  onOpenAuth: () => void;
  onToggleAccountMenu: () => void;
  onSignOut: () => void;
  displayCurrency: SupportedDisplayCurrency;
  onDisplayCurrencyChange: (currency: SupportedDisplayCurrency) => void;
};

function HeaderIconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button type="button" disabled className="hidden h-10 w-10 cursor-not-allowed items-center justify-center rounded-full text-[var(--color-text-secondary)] opacity-70 sm:inline-flex" aria-label={`${label} (շուտով)`} title={`${label} (շուտով)`}>
      {children}
    </button>
  );
}

export function HeaderActions({ userEmail, isAccountMenuOpen, onOpenAuth, onToggleAccountMenu, onSignOut, displayCurrency, onDisplayCurrencyChange }: HeaderActionsProps) {
  return (
    <div className="relative ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
      <HeaderIconButton label="Մուգ տեսք"><Moon size={24} aria-hidden="true" /></HeaderIconButton>
      <HeaderIconButton label="Ծանուցումներ"><Bell size={23} aria-hidden="true" /></HeaderIconButton>
      <HeaderIconButton label="Նախընտրելիներ"><Heart size={25} aria-hidden="true" /></HeaderIconButton>
      <Link href="/shop" className="hidden h-11 items-center rounded-full border-2 border-[var(--color-action-blue)] px-5 text-base font-bold text-[var(--color-action-blue)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)] focus-visible:ring-offset-2 xl:inline-flex">Համեմատել</Link>
      {!userEmail ? (
        <button type="button" onClick={onOpenAuth} className="inline-flex h-11 items-center rounded-full bg-[var(--color-action-blue)] px-5 text-base font-bold text-white transition hover:bg-[var(--color-action-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)] focus-visible:ring-offset-2">Մուտք</button>
      ) : (
        <>
          <button type="button" onClick={onToggleAccountMenu} aria-expanded={isAccountMenuOpen} aria-label="Բացել հաշվի ընտրացանկը" className="inline-flex h-11 max-w-40 items-center gap-2 rounded-full bg-[var(--color-action-blue)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-action-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)] focus-visible:ring-offset-2">
            <UserRound size={18} aria-hidden="true" />
            <span className="truncate">{userEmail}</span>
          </button>
          {isAccountMenuOpen ? (
            <div className="absolute right-0 top-14 z-50 w-56 rounded-lg border border-[var(--color-border)] bg-white p-2 shadow-[var(--shadow-subtle)]">
              <p className="truncate px-3 py-2 text-xs text-[var(--color-text-muted)]">{userEmail}</p>
              <label className="block border-y border-[var(--color-border-muted)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)]">
                Ցուցադրման արժույթ
                <select value={displayCurrency} onChange={(event) => onDisplayCurrencyChange(event.target.value as SupportedDisplayCurrency)} className="mt-1.5 h-8 w-full rounded border border-[var(--color-border)] bg-white px-2 text-xs font-medium text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-action-blue)]">
                  {SUPPORTED_DISPLAY_CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency} — {CURRENCY_LABELS[currency]}</option>)}
                </select>
              </label>
              <button type="button" onClick={onSignOut} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-header-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)]"><LogOut size={16} aria-hidden="true" /> Ելք</button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
