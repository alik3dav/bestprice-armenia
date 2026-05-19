import { ReactNode } from "react";

export function DataTableShell({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="space-y-3 rounded border bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex gap-2">
          <input className="rounded border px-2 py-1 text-sm" placeholder="Search..." />
          <select className="rounded border px-2 py-1 text-sm"><option>All statuses</option></select>
        </div>
      </div>
      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr><th className="p-2">Name</th><th className="p-2">Status</th><th className="p-2">Updated</th></tr>
          </thead>
          <tbody><tr><td className="p-3 text-slate-500" colSpan={3}>No records yet.</td></tr></tbody>
        </table>
      </div>
      <div className="flex justify-between text-xs text-slate-500"><span>Page 1 of 1</span><span>0 total</span></div>
      {children}
    </section>
  );
}
