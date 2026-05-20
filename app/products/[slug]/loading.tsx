export default function ProductLoadingPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-40 rounded bg-slate-200" />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square rounded-2xl bg-slate-200" />
          <div className="space-y-3">
            <div className="h-4 w-28 rounded bg-slate-200" />
            <div className="h-9 w-3/4 rounded bg-slate-200" />
            <div className="h-20 w-full rounded bg-slate-200" />
          </div>
        </div>
      </div>
    </main>
  );
}
