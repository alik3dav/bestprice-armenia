"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/public/auth-modal";
import { HeaderActions } from "@/components/public/header/header-actions";
import { HeaderLogo } from "@/components/public/header/header-logo";
import { HeaderNavigation } from "@/components/public/header/header-navigation";
import { HeaderSearch } from "@/components/public/header/header-search";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_CURRENCY, type SupportedDisplayCurrency } from "@/lib/money";
import { setDisplayCurrency } from "@/components/public/price-text";

type PublicHeaderProps = {
  userEmail: string | null;
};

export function PublicHeader({ userEmail }: PublicHeaderProps) {
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [displayCurrency, setDisplayCurrencyState] = useState<SupportedDisplayCurrency>(DEFAULT_CURRENCY);

  useEffect(() => {
    const savedCurrency = window.localStorage.getItem("bp_display_currency");
    if (savedCurrency === "AMD" || savedCurrency === "EUR" || savedCurrency === "USD") setDisplayCurrencyState(savedCurrency);

    const openAuthModal = () => setIsAuthOpen(true);
    window.addEventListener("bp:open-auth", openAuthModal);
    return () => window.removeEventListener("bp:open-auth", openAuthModal);
  }, []);

  function handleDisplayCurrencyChange(currency: SupportedDisplayCurrency) {
    setDisplayCurrencyState(currency);
    setDisplayCurrency(currency);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const searchParams = new URLSearchParams();
    if (query.trim()) searchParams.set("q", query.trim());
    router.push(`/search${searchParams.size ? `?${searchParams}` : ""}` as Route);
  }

  async function handleSignOut() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-header-surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:gap-8 lg:px-8 lg:py-5">
          <HeaderLogo />
          <HeaderSearch query={query} onQueryChange={setQuery} onSubmit={handleSearchSubmit} />
          <HeaderActions userEmail={userEmail} isAccountMenuOpen={isAccountMenuOpen} onOpenAuth={() => setIsAuthOpen(true)} onToggleAccountMenu={() => setIsAccountMenuOpen((value) => !value)} onSignOut={handleSignOut} displayCurrency={displayCurrency} onDisplayCurrencyChange={handleDisplayCurrencyChange} />
        </div>
        <HeaderNavigation />
      </header>
      <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
