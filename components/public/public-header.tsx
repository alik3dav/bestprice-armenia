"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, User } from "lucide-react";
import { AuthModal } from "@/components/public/auth-modal";
import { createClient } from "@/lib/supabase/client";
import { CURRENCY_LABELS, DEFAULT_CURRENCY, SUPPORTED_DISPLAY_CURRENCIES, type SupportedDisplayCurrency } from "@/lib/money";
import { setDisplayCurrency } from "@/components/public/price-text";

export function PublicHeader({ userEmail }: { userEmail: string | null }) {
  const [openAuth, setOpenAuth] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [displayCurrency, setDisplayCurrencyState] = useState<SupportedDisplayCurrency>(DEFAULT_CURRENCY);

  useEffect(() => {
    const value = window.localStorage.getItem("bp_display_currency");
    if (value === "EUR" || value === "USD" || value === "AMD") setDisplayCurrencyState(value);
  }, []);

  async function handleԵլք() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">BestPrice</Link>
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
      </header>
      <AuthModal open={openAuth} onClose={() => setOpenAuth(false)} />
    </>
  );
}
