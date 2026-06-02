"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

type DeleteResult = { ok: boolean; message: string };

type TableRowActionsProps = {
  itemLabel: string;
  itemName: string;
  editHref: string;
  detailsHref?: string;
  onDelete: () => Promise<DeleteResult>;
};

export function TableRowActions({ itemLabel, itemName, editHref, detailsHref, onDelete }: TableRowActionsProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<DeleteResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const deleteLabel = `Delete ${itemLabel}`;
  const editLabel = `Edit ${itemLabel}`;
  const detailsLabel = `View ${itemLabel} details`;

  return (
    <div className="flex items-center justify-end gap-1">
      {detailsHref ? (
        <Link href={detailsHref as Route} aria-label={detailsLabel} title={detailsLabel} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-teal-500/30">
          <Eye className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
      <Link href={editHref as Route} aria-label={editLabel} title={editLabel} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-teal-500/30">
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </Link>

      <AlertDialog.Root>
        <AlertDialog.Trigger asChild>
          <button type="button" aria-label={deleteLabel} title={deleteLabel} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/30" disabled={isPending}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/10">
            <AlertDialog.Title className="text-base font-semibold">Delete {itemLabel}?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-slate-600">
              This action cannot be undone. <span className="font-medium">{itemName}</span> will be permanently removed.
            </AlertDialog.Description>
            <div className="mt-4 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button type="button" className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50" disabled={isPending}>Cancel</button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  className="rounded-xl bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                  disabled={isPending}
                  onClick={(event) => {
                    event.preventDefault();
                    setFeedback(null);
                    startTransition(async () => {
                      const result = await onDelete();
                      setFeedback(result);
                      if (result.ok) router.refresh();
                    });
                  }}
                >
                  {isPending ? "Deleting..." : "Delete"}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {feedback ? <span className={`ml-1 hidden text-xs sm:inline ${feedback.ok ? "text-emerald-600" : "text-red-600"}`}>{feedback.message}</span> : null}
    </div>
  );
}
