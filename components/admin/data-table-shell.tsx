import { ReactNode } from "react";
import { AlertCircle, Inbox, Loader2, Search } from "lucide-react";

type DataTableState = "loading" | "error" | "empty" | "ready";

type DataTableShellProps = {
  title: string;
  rows?: ReactNode;
  state?: DataTableState;
  errorMessage?: string;
  total?: number;
  children?: ReactNode;
  columnCount?: number;
  headers?: ReactNode;
  description?: string;
};

function TableStateMessage({ state, errorMessage }: { state: Exclude<DataTableState, "ready">; errorMessage?: string }) {
  const stateConfig = {
    loading: {
      icon: Loader2,
      title: "Loading records",
      message: "Fetching the latest admin data...",
      className: "animate-spin text-slate-400"
    },
    error: {
      icon: AlertCircle,
      title: "Could not load records",
      message: errorMessage ?? "Failed to load records.",
      className: "text-red-500"
    },
    empty: {
      icon: Inbox,
      title: "No records yet",
      message: "Create your first record or adjust filters to see results.",
      className: "text-slate-400"
    }
  }[state];
  const Icon = stateConfig.icon;

  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-4 py-10 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
        <Icon className={`h-5 w-5 ${stateConfig.className}`} aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-slate-900">{stateConfig.title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{stateConfig.message}</p>
    </div>
  );
}

export function DataTableShell({
  title,
  rows,
  state = "empty",
  errorMessage,
  total,
  children,
  columnCount = 3,
  headers,
  description = "Search, filter, and review records in a compact operational table."
}: DataTableShellProps) {
  const body =
    state === "ready" ? (
      rows
    ) : (
      <tr>
        <td colSpan={columnCount}>
          <TableStateMessage state={state} errorMessage={errorMessage} />
        </td>
      </tr>
    );

  const totalCount = typeof total === "number" ? total : state === "ready" ? 1 : 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input className="h-9 w-52 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-500/10" placeholder="Search..." aria-label={`Search ${title}`} />
          </label>
          <select className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-500/10" aria-label="Filter by status">
            <option>All statuses</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="admin-table w-full min-w-[760px] text-sm">
          <thead>{headers ?? <tr><th>Name</th><th>Status</th><th>Updated</th></tr>}</thead>
          <tbody>{body}</tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Page 1 of 1</span>
        <div className="flex items-center gap-3">
          <span>{totalCount} total</span>
          {children}
        </div>
      </div>
    </section>
  );
}
