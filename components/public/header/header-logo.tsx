import Link from "next/link";

export function HeaderLogo() {
  return (
    <Link
      href="/"
      className="shrink-0 text-[22px] font-extrabold tracking-tight text-[var(--color-brand-red)] outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)] focus-visible:ring-offset-4 sm:text-[26px]"
      aria-label="PriceMaster AM գլխավոր էջ"
    >
      PriceMaster AM
    </Link>
  );
}
