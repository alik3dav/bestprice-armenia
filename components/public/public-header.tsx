"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Search, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/public/auth-modal";
import { createClient } from "@/lib/supabase/client";
import { CURRENCY_LABELS, DEFAULT_CURRENCY, SUPPORTED_DISPLAY_CURRENCIES, type SupportedDisplayCurrency } from "@/lib/money";
import { setDisplayCurrency } from "@/components/public/price-text";

const quickLinks: { href: Route; label: string }[] = [
  { href: "/categories", label: "Կատեգորիաներ" },
  { href: "/shop", label: "Ապրանքներ" },
  { href: "/#latest-products", label: "Նոր ապրանքներ" },
];

export function PublicHeader({ userEmail }: { userEmail: string | null }) {
  const router = useRouter();
  const [openAuth, setOpenAuth] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [displayCurrency, setDisplayCurrencyState] = useState<SupportedDisplayCurrency>(DEFAULT_CURRENCY);

  useEffect(() => {
    const value = window.localStorage.getItem("bp_display_currency");
    if (value === "EUR" || value === "USD" || value === "AMD") setDisplayCurrencyState(value);

    const openAuthListener = () => setOpenAuth(true);
    window.addEventListener("bp:open-auth", openAuthListener as EventListener);
    return () => window.removeEventListener("bp:open-auth", openAuthListener as EventListener);
  }, []);

  async function handleԵլք() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.reload();
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      router.push("/search");
      setMobileSearchOpen(false);
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setMobileSearchOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-3 px-3 sm:px-5 lg:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2 text-[var(--color-text-primary)]" aria-label="BestPrice Armenia homepage">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-brand-red)] text-sm font-bold text-white">BP</span>
            <span className="hidden min-w-0 flex-col leading-tight sm:flex">
              <span className="text-base font-semibold tracking-tight">BestPrice</span>
              <span className="text-xs text-[var(--color-text-muted)]">Armenia</span>
            </span>
          </Link>

          <form onSubmit={handleSearchSubmit} className="hidden min-w-0 flex-1 items-center rounded-md border border-[var(--color-border)] bg-[var(--color-page-bg)] md:flex">
            <label className="flex h-11 min-w-0 flex-1 items-center gap-2 px-3 text-[var(--color-text-muted)]">
              <Search size={17} />
              <span className="sr-only">Որոնել ապրանքներ</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Որոնել ապրանք, բրենդ կամ կատեգորիա"
                className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
              />
            </label>
            <button
              type="submit"
              className="mr-1 inline-flex h-9 items-center justify-center gap-2 rounded bg-[var(--color-brand-red)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-red-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)] focus:ring-offset-2"
              aria-label="Search"
            >
              Որոնել
            </button>
          </form>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-md px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-page-bg)] hover:text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)] focus:ring-offset-2">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] md:hidden" aria-label="Open search" onClick={() => setMobileSearchOpen(true)}>
              <Search size={17} />
            </button>
            {!userEmail ? (
              <button className="h-10 rounded-md border border-[var(--color-border)] bg-white px-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-page-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)] focus:ring-offset-2 sm:px-4" onClick={() => setOpenAuth(true)}>
                Մուտք
              </button>
            ) : (
              <div className="relative flex items-center gap-2">
                <div className="hidden h-10 max-w-40 items-center gap-2 rounded-md border border-[var(--color-border-muted)] bg-[var(--color-page-bg)] px-3 text-sm text-[var(--color-text-secondary)] sm:flex">
                  <User size={16} />
                  <span className="truncate">{userEmail}</span>
                </div>
                <button className="inline-flex h-10 items-center gap-1 rounded-md border border-[var(--color-border)] bg-white px-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-page-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)] focus:ring-offset-2" onClick={() => setOpenMenu((v) => !v)} aria-expanded={openMenu} aria-label="Open account menu">
                  <Menu size={16} />
                  <ChevronDown size={14} className="hidden sm:block" />
                </button>
                {openMenu && (
                  <div className="absolute right-0 top-12 w-64 rounded-md border border-[var(--color-border)] bg-white p-2 shadow-[var(--shadow-subtle)]">
                    <a className="block rounded px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-page-bg)]" href="#">Անձնական էջ / Հաշիվ</a>
                    <div className="border-y border-[var(--color-border-muted)] px-3 py-2">
                      <p className="text-xs text-[var(--color-text-muted)]">Ցուցադրման արժույթ</p>
                      <select value={displayCurrency} onChange={(e) => { const c = e.target.value as SupportedDisplayCurrency; setDisplayCurrencyState(c); setDisplayCurrency(c); }} className="mt-1 h-8 w-full rounded border border-[var(--color-border)] bg-white px-2 text-xs text-[var(--color-text-primary)]">
                        {SUPPORTED_DISPLAY_CURRENCIES.map((c) => <option key={c} value={c}>{c} — {CURRENCY_LABELS[c]}</option>)}
                      </select>
                    </div>
                    <button className="block w-full rounded px-3 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-page-bg)]" onClick={handleԵլք}>Ելք</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--color-border-muted)] lg:hidden">
          <nav className="mx-auto flex max-w-[1200px] gap-2 overflow-x-auto px-3 py-2 sm:px-5" aria-label="Marketplace links">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="shrink-0 rounded border border-[var(--color-border-muted)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {mobileSearchOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 p-3 md:hidden" onClick={() => setMobileSearchOpen(false)}>
          <div className="mt-16 rounded-lg border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-subtle)]" onClick={(event) => event.stopPropagation()}>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-page-bg)] p-1">
              <label className="flex min-h-10 flex-1 items-center gap-2 px-2 text-[var(--color-text-muted)]">
                <Search size={16} />
                <span className="sr-only">Որոնել ապրանքներ</span>
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Որոնել ապրանքներ..."
                  className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
                />
              </label>
              <button type="submit" className="h-10 rounded bg-[var(--color-brand-red)] px-3 text-sm font-semibold text-white" aria-label="Search">
                Որոնել
              </button>
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded text-[var(--color-text-secondary)] hover:bg-white" onClick={() => setMobileSearchOpen(false)} aria-label="Close search">
                <X size={16} />
              </button>
            </form>
          </div>
        </div>
      ) : null}
      <AuthModal open={openAuth} onClose={() => setOpenAuth(false)} />
    </>
  );
}
