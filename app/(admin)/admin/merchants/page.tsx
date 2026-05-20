import Link from "next/link";
import { DataTableShell } from "@/components/admin/data-table-shell";

export default function Page() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Link href="/admin/merchants/new" className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
          Create merchant
        </Link>
      </div>
      <DataTableShell title="Merchants Management" />
    </div>
  );
}
