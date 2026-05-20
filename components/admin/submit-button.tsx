"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ label, loadingLabel, disabled }: { label: string; loadingLabel: string; disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? loadingLabel : label}
    </button>
  );
}
