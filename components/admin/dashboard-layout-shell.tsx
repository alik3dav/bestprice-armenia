import type { ReactNode } from "react";

type DashboardLayoutShellProps = {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
};

export function DashboardLayoutShell({ sidebar, topbar, children }: DashboardLayoutShellProps) {
  return (
    <div className="min-h-screen bg-[#F5F6F8] text-slate-950">
      <div className="flex min-h-screen overflow-hidden">
        {sidebar}
        <div className="flex min-w-0 flex-1 flex-col">
          {topbar}
          <main className="flex-1 overflow-auto px-4 py-5 sm:px-5 lg:px-6">
            <div className="mx-auto w-full max-w-[1440px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
