import Link from "next/link";
import { Globe2, Radio, Share2 } from "lucide-react";
import type { Route } from "next";

type InternalFooterLink = {
  href: Route;
  label: string;
};

type ExternalFooterLink = {
  href: `mailto:${string}`;
  label: string;
  external: true;
};

const footerLinkGroups: { title: string; links: (InternalFooterLink | ExternalFooterLink)[] }[] = [
  {
    title: "Կատեգորիաներ",
    links: [
      { href: "/categories", label: "Տեխնոլոգիա" },
      { href: "/categories", label: "Տուն և կենցաղ" },
      { href: "/categories", label: "Նորաձևություն" },
      { href: "/categories", label: "Առողջություն" }
    ]
  },
  {
    title: "Ընկերություն",
    links: [
      { href: "/", label: "Մեր մասին" },
      { href: "/merchant/login", label: "Աշխատատեղեր" },
      { href: "mailto:support@pricemaster.am", label: "Կոնտակտ", external: true },
      { href: "/search", label: "Օգնության կենտրոն" }
    ]
  },
  {
    title: "Իրավական",
    links: [
      { href: "/", label: "Գաղտնիության քաղաքականություն" },
      { href: "/", label: "Օգտագործման պայմաններ" },
      { href: "/", label: "Cookies" }
    ]
  }
];

const footerLinkClassName = "text-sm leading-6 text-[var(--color-text-secondary)] transition hover:text-[var(--color-action-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)] focus-visible:ring-offset-2";

export function PublicFooter() {
  return (
    <footer className="mt-10 w-full border-t border-[var(--color-border)] bg-[var(--color-header-surface)]">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,2.1fr)_repeat(3,minmax(0,1fr))_minmax(220px,1.35fr)] lg:gap-10">
          <div className="max-w-sm">
            <Link href="/" className="text-xl font-extrabold tracking-tight text-[var(--color-brand-red)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)] focus-visible:ring-offset-4">
              PriceMaster AM
            </Link>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">Հայաստանի վստահելի գների համեմատման հարթակ, որն օգնում է խնայել ժամանակն ու գումարը։</p>
            <div className="mt-5 flex items-center gap-4 text-[var(--color-text-secondary)]" aria-label="PriceMaster AM հղումներ">
              <Globe2 className="h-5 w-5" aria-hidden="true" />
              <Share2 className="h-5 w-5" aria-hidden="true" />
              <Radio className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>

          {footerLinkGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">{group.title}</h2>
              <ul className="mt-4 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {"external" in link ? <a href={link.href} className={footerLinkClassName}>{link.label}</a> : <Link href={link.href} className={footerLinkClassName}>{link.label}</Link>}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <aside className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-subtle)]">
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">PriceMaster For Merchants</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">Ավելի շատ գնորդներ</p>
            <Link href="/merchant/login" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--color-action-blue)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-action-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)] focus-visible:ring-offset-2">Ավելին իմանալ</Link>
          </aside>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 text-xs leading-5 text-[var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PriceMaster AM. Բոլոր իրավունքները պաշտպանված են։ Հայկական գների համեմատման հարթակ։</p>
          <div className="flex items-center gap-6 font-bold text-[var(--color-action-blue)]">
            <span>3,823 խանութ</span>
            <span>28M+ ապրանք</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
