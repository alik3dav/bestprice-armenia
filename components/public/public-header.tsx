"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Search, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/public/auth-modal";
import { createClient } from "@/lib/supabase/client";
import { CURRENCY_LABELS, DEFAULT_CURRENCY, SUPPORTED_DISPLAY_CURRENCIES, type SupportedDisplayCurrency } from "@/lib/money";
import { setDisplayCurrency } from "@/components/public/price-text";

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
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="flex h-16 w-full items-center px-4 sm:px-6 lg:px-10">
          <div className="flex min-w-0 flex-1 items-center">
            <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">BestPrice</Link>
          </div>

          <div className="hidden flex-[1.4] px-6 md:block">
            <form onSubmit={handleSearchSubmit} className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              <Search size={16} className="text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Որոնել ապրանքներ..."
                className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <button type="submit" className="rounded-full p-1 text-slate-600 hover:bg-slate-200" aria-label="Search">
                <Search size={16} />
              </button>
            </form>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            <button type="button" className="rounded-lg border border-slate-200 p-2 md:hidden" aria-label="Open search" onClick={() => setMobileSearchOpen(true)}>
              <Search size={16} />
            </button>
            {!userEmail ? (
              <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={() => setOpenAuth(true)}>
                Մուտք
              </button>
            ) : (
              <div className="relative flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  <User size={16} />
                </div>
                <button className="rounded-lg border border-slate-200 p-2" onClick={() => setOpenMenu((v) => !v)}>
                  <Menu size={16} />
                </button>
                {openMenu && (
                  <div className="absolute right-0 top-12 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                    <a className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100" href="#">Անձնական էջ / Հաշիվ</a>
                    <div className="px-3 py-2">
                      <p className="text-xs text-slate-500">Ցուցադրման արժույթ</p>
                      <select value={displayCurrency} onChange={(e) => { const c = e.target.value as SupportedDisplayCurrency; setDisplayCurrencyState(c); setDisplayCurrency(c); }} className="mt-1 w-full rounded border px-2 py-1 text-xs">
                        {SUPPORTED_DISPLAY_CURRENCIES.map((c) => <option key={c} value={c}>{c} — {CURRENCY_LABELS[c]}</option>)}
                      </select>
                    </div>
                    <button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100" onClick={handleԵլք}>Ելք</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      {mobileSearchOpen ? (
        <div className="fixed inset-0 z-50 bg-black/30 p-4 md:hidden" onClick={() => setMobileSearchOpen(false)}>
          <div className="mt-16 rounded-2xl bg-white p-3" onClick={(event) => event.stopPropagation()}>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              <Search size={16} className="text-slate-500" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Որոնել ապրանքներ..."
                className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <button type="button" className="rounded-full p-1 text-slate-600 hover:bg-slate-200" onClick={() => setMobileSearchOpen(false)} aria-label="Close search">
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
