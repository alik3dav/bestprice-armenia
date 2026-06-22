# BestPrice Armenia Codex Agent Instructions

These instructions apply to the entire repository. Every Codex agent must read this file before making changes, then read the referenced project guides relevant to the task.

## Mandatory reading order before any update

1. `AGENTS.md` (this file).
2. `CODEX.md` for project-wide implementation workflow and quality gates.
3. `DESIGN.md` for the active design language and token reference.
4. `docs/brand-ui-guidelines.md` before any UI, UX, layout, styling, component, page, marketplace, product, category, filter, responsive, or accessibility work.
5. `docs/architecture-guidelines.md` before changing app structure, routes, components, libraries, data loading, server actions, forms, or reusable patterns.
6. `docs/supabase-guidelines.md` before changing database schema, Supabase clients, RLS, storage, auth, migrations, queries, or data-access code.

If these guides conflict, follow this priority: direct user/developer instructions, then the most specific `AGENTS.md`, then `CODEX.md`, then task-specific docs, then existing code conventions.

## Product context

BestPrice Armenia is a price-comparison and product-discovery marketplace for Armenia. Changes must optimize for fast scanning, search-first shopping flows, dense but readable product information, trustworthy merchant/product data, and Armenian-first localization with Russian and English compatibility.

## Non-negotiable implementation rules

- Keep changes component-based, reusable, and split into small focused files.
- Prefer shared components and variants over copied markup or long repeated Tailwind class strings.
- Preserve the Next.js App Router structure and use server components by default unless interactivity requires a client component.
- Keep client components small and push data fetching, validation, and authorization to server-side code where practical.
- Do not add new UI colors, spacing, card styles, button styles, or layout patterns unless they are documented first in `DESIGN.md` and/or `docs/brand-ui-guidelines.md`.
- Keep Supabase schema changes migration-first, RLS-safe, indexed for expected marketplace queries, and compatible with public read/admin/merchant access boundaries.
- Never put `try`/`catch` blocks around imports.

## Required checks

Run the most relevant checks after changes. Prefer at minimum:

- `npm run typecheck`
- `npm run build` when routes, data loading, Next config, or production behavior changed.

If a check cannot run because of an environment limitation, document the limitation in the final response.
