import { Camera, Menu, Search } from "lucide-react";

type HeaderSearchProps = {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function HeaderSearch({ query, onQueryChange, onSubmit }: HeaderSearchProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="order-3 flex h-12 w-full items-center rounded-full border border-[var(--color-border)] bg-[var(--color-header-surface)] px-3 shadow-[var(--shadow-subtle)] lg:order-none lg:h-16 lg:max-w-[740px] lg:flex-1"
    >
      <Menu className="mx-1 shrink-0 text-[var(--color-text-secondary)]" size={24} aria-hidden="true" />
      <label className="flex min-w-0 flex-1 items-center gap-3 border-l border-[var(--color-border)] pl-4 text-[var(--color-text-muted)]">
        <span className="sr-only">Որոնել ապրանքներ</span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Ի՞նչ եք փնտրում..."
          className="h-10 min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
        />
      </label>
      <button
        type="button"
        disabled
        className="hidden h-10 w-10 shrink-0 cursor-not-allowed items-center justify-center rounded-full text-[var(--color-text-secondary)] opacity-70 lg:inline-flex"
        aria-label="Որոնել նկարով (շուտով)"
        title="Որոնել նկարով (շուտով)"
      >
        <Camera size={23} aria-hidden="true" />
      </button>
      <button
        type="submit"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-action-blue)] text-white transition hover:bg-[var(--color-action-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-blue)] focus-visible:ring-offset-2 lg:h-12 lg:w-12"
        aria-label="Որոնել"
        title="Որոնել"
      >
        <Search size={23} aria-hidden="true" />
      </button>
    </form>
  );
}
