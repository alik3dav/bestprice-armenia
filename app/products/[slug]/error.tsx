"use client";

export default function ProductErrorPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load this product right now. Please refresh and try again.
      </div>
    </main>
  );
}
