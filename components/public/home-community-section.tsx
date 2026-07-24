import Link from "next/link";
import { AtSign, MessageSquareText } from "lucide-react";

const popularSearches = [
  "iphone 16 pro max",
  "birkenstock",
  "nintendo switch",
  "ps5",
  "airpods",
  "apple watch",
  "crocs",
  "power bank",
  "sup",
  "new balance 530",
];

const communityImageSrc = "";

export function HomeCommunitySection() {
  return (
    <section className="px-3 pb-8 pt-4 sm:px-5 sm:pb-10 sm:pt-6 lg:px-6" aria-labelledby="community-heading">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-header-surface)] sm:grid-cols-[minmax(0,1fr)_minmax(260px,312px)]">
          <div className="flex min-h-[272px] flex-col justify-center p-6 sm:p-10">
            <h2 id="community-heading" className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
              Մի&apos; կորցրեք առաջարկը։
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base">
              Ստացեք ամենաշատ «թոփ» առաջարկների մասին ծանուցումները հենց ձեր հեռախոսին։
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <a
                href="https://www.viber.com/"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#7360f2] px-5 text-sm font-bold text-white shadow-[var(--shadow-subtle)] transition hover:bg-[#6550e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)] focus-visible:ring-offset-2"
              >
                <MessageSquareText className="h-5 w-5" aria-hidden="true" />
                Viber
              </a>
              <a
                href="https://telegram.org/"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-black px-5 text-sm font-bold text-white shadow-[var(--shadow-subtle)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)] focus-visible:ring-offset-2"
              >
                <AtSign className="h-5 w-5" aria-hidden="true" />
                Telegram
              </a>
            </div>
          </div>

          <div className="min-h-[180px] bg-[var(--color-border-muted)] sm:min-h-full">
            {communityImageSrc ? <img src={communityImageSrc} alt="" className="h-full w-full object-cover" /> : null}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-extrabold text-[var(--color-text-primary)]">Հանրաճանաչ որոնումներ</h2>
          <nav className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label="Հանրաճանաչ որոնումներ">
            {popularSearches.map((search) => (
              <Link
                key={search}
                href={`/search?q=${encodeURIComponent(search)}`}
                className="shrink-0 rounded-md border border-[var(--color-border-muted)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] shadow-[var(--shadow-subtle)] transition hover:border-[var(--color-border)] hover:text-[var(--color-action-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)] focus-visible:ring-offset-2"
              >
                {search}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
