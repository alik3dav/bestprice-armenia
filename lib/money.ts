export const DEFAULT_CURRENCY = "AMD" as const;
export const SUPPORTED_DISPLAY_CURRENCIES = ["AMD", "EUR", "USD"] as const;
export type SupportedDisplayCurrency = (typeof SUPPORTED_DISPLAY_CURRENCIES)[number];

export const CURRENCY_LABELS: Record<SupportedDisplayCurrency, string> = {
  AMD: "Հայկական դրամ",
  EUR: "Եվրո",
  USD: "ԱՄՆ դոլար",
};

export const FALLBACK_RATES_FROM_AMD: Record<SupportedDisplayCurrency, number> = {
  AMD: 1,
  EUR: 0.0023,
  USD: 0.0026,
};

export function parsePriceInput(value: FormDataEntryValue | null | undefined) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return { ok: false as const, error: "Price is required." };
  const parsed = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(parsed) || parsed < 0) return { ok: false as const, error: "Price must be a non-negative number." };
  return { ok: true as const, value: Math.round(parsed) };
}

export function convertMoney(amountAMD: number, targetCurrency: SupportedDisplayCurrency, rates = FALLBACK_RATES_FROM_AMD) {
  const rate = rates[targetCurrency] ?? 1;
  return amountAMD * rate;
}

export function formatMoney(amount: number, currency: SupportedDisplayCurrency) {
  const rounded = currency === "AMD" ? Math.round(amount) : amount;
  const formatted = new Intl.NumberFormat("hy-AM", {
    maximumFractionDigits: currency === "AMD" ? 0 : 2,
    minimumFractionDigits: currency === "AMD" ? 0 : 2,
  }).format(rounded);
  return currency === "AMD" ? `֏${formatted}` : `${formatted} ${currency}`;
}
