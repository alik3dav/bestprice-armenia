import Link from "next/link";
import { headerLinks } from "@/components/public/header/header-links";

export function HeaderNavigation() {
  return (
    <nav className="border-t border-[var(--color-border-muted)]" aria-label="Ապրանքների կատեգորիաներ">
      <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-7 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {headerLinks.map((link, index) => (
          <Link
            key={link.label}
            href={link.href}
            className={`relative shrink-0 py-4 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:text-[var(--color-action-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)] focus-visible:ring-offset-2 ${
              index === 0 ? "text-[var(--color-action-blue)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[var(--color-action-blue)]" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
