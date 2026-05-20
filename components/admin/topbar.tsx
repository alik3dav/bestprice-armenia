type DashboardTopbarProps = {
  heading: string;
  subheading: string;
};

export function DashboardTopbar({ heading, subheading }: DashboardTopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4">
      <p className="text-sm font-medium">{heading}</p>
      <p className="text-xs text-slate-500">{subheading}</p>
    </header>
  );
}

export function AdminTopbar() {
  return <DashboardTopbar heading="Admin Dashboard" subheading="Dense workflow mode" />;
}
