import type { ReactNode } from "react";

type StateMessageProps = {
  children: ReactNode;
  className?: string;
};

function baseClass(className?: string) {
  return ["rounded-xl p-4 text-sm", className].filter(Boolean).join(" ");
}

export function EmptyState({ children, className }: StateMessageProps) {
  return <p className={baseClass(["border border-dashed border-slate-300 text-slate-500", className].filter(Boolean).join(" "))}>{children}</p>;
}

export function ErrorState({ children, className }: StateMessageProps) {
  return <p className={baseClass(["border border-red-200 bg-red-50 text-red-700", className].filter(Boolean).join(" "))}>{children}</p>;
}

export function LoadingState({ children = "Loading...", className }: { children?: ReactNode; className?: string }) {
  return <p className={baseClass(["border border-slate-200 bg-slate-50 text-slate-600", className].filter(Boolean).join(" "))}>{children}</p>;
}
