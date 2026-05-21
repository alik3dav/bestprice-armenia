"use client";

import { useEffect, useState } from "react";
import { convertMoney, DEFAULT_CURRENCY, FALLBACK_RATES_FROM_AMD, formatMoney, type SupportedDisplayCurrency } from "@/lib/money";

const STORAGE_KEY = "bp_display_currency";

export function getStoredDisplayCurrency(): SupportedDisplayCurrency {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "EUR" || value === "USD" || value === "AMD" ? value : DEFAULT_CURRENCY;
}

export function PriceText({ amountAMD }: { amountAMD: number }) {
  const [currency, setCurrency] = useState<SupportedDisplayCurrency>(DEFAULT_CURRENCY);

  useEffect(() => {
    const sync = () => setCurrency(getStoredDisplayCurrency());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("bp:currency-change", sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("bp:currency-change", sync as EventListener);
    };
  }, []);

  const value = currency === "AMD" ? amountAMD : convertMoney(amountAMD, currency, FALLBACK_RATES_FROM_AMD);
  return <>{formatMoney(value, currency)}</>;
}

export function setDisplayCurrency(currency: SupportedDisplayCurrency) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, currency);
  window.dispatchEvent(new CustomEvent("bp:currency-change"));
}
