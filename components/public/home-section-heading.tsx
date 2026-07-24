import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type HomeSectionHeadingProps = {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    href: ComponentProps<typeof Link>["href"];
  };
};

export function HomeSectionHeading({ id, title, description, icon, action }: HomeSectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="flex items-center gap-2 text-xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-2xl">
          {icon}
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className="inline-flex min-h-10 shrink-0 items-center gap-1 text-sm font-semibold text-[var(--color-action-blue)] transition hover:text-[var(--color-action-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)] focus-visible:ring-offset-2">
          {action.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
