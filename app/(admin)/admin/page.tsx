export default function DashboardPage() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        "Products",
        "Active Offers",
        "Merchants",
        "Pending Specs"
      ].map((kpi) => (
        <article key={kpi} className="rounded border bg-white p-4">
          <p className="text-xs text-slate-500">{kpi}</p>
          <p className="text-2xl font-semibold">0</p>
        </article>
      ))}
    </div>
  );
}
