import Link from "next/link";

const items = [
  ["Dashboard", "/admin"],
  ["Products", "/admin/products"],
  ["Categories", "/admin/categories"],
  ["Merchants", "/admin/merchants"],
  ["Users", "/admin/users"],
  ["Offers", "/admin/offers"],
  ["Spec Templates", "/admin/spec-templates"]
];

export function AdminSidebar() {
  return (
    <aside className="w-60 border-r bg-white p-3">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">BestPrice CRM</h2>
      <nav className="space-y-1">
        {items.map(([label, href]) => (
          <Link key={href} href={href} className="block rounded px-3 py-2 text-sm hover:bg-slate-100">
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
