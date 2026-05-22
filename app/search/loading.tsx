import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";

export default function SearchLoadingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <PublicHeader userEmail={null} />
      <section className="w-full px-4 py-8 sm:px-6 lg:px-10">
        <h1 className="text-2xl font-semibold">Որոնման արդյունքներ</h1>
        <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">Բեռնվում է...</p>
      </section>
      <PublicFooter />
    </main>
  );
}
