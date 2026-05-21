"use client";

export function FooterLoginButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("bp:open-auth"))}
      className="text-sm text-slate-600 transition hover:text-slate-900"
    >
      Մուտք
    </button>
  );
}
