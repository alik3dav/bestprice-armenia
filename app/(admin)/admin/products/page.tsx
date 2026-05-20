import Link from "next/link";
import { DataTableShell } from "@/components/admin/data-table-shell";

export default function Page() {
  return (
    <DataTableShell title="Products Management">
      <div className="flex justify-end">
        <Link href="/admin/products/new" className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          New product
        </Link>
      </div>
    </DataTableShell>
  );
}
