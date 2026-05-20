import type { ReactNode } from "react";

type DashboardLayoutShellProps = {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
};

export function DashboardLayoutShell({ sidebar, topbar, children }: DashboardLayoutShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {sidebar}
      <div className="flex flex-1 flex-col">
        {topbar}
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
