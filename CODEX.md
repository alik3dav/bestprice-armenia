# Codex Operating Guide

Codex agents should use this guide as the repository-level workflow for all updates.

## Before editing

- Read `AGENTS.md`, this file, `DESIGN.md`, and any task-specific docs in `docs/`.
- Inspect existing implementations before creating new patterns.
- Identify whether the change touches public marketplace UI, admin UI, merchant UI, Supabase schema, auth, or shared utilities.
- Plan for small, focused, reviewable changes.

## Project architecture expectations

- Framework: Next.js App Router with TypeScript.
- Styling: Tailwind CSS with documented marketplace/design tokens.
- Data/auth: Supabase PostgreSQL, Auth, Storage, and RLS.
- UI organization:
  - `app/` contains routes, layouts, loading/error states, and route-level composition.
  - `components/public/` contains reusable public marketplace components.
  - `components/admin/` contains reusable admin dashboard components.
  - `lib/` contains shared utilities, formatting, auth guards, slugs, i18n, and Supabase clients.
  - `supabase/migrations/` contains append-only database migrations.
  - `docs/` contains living implementation guidance.

## Coding rules

- Use TypeScript types for component props, query results, and form payloads.
- Keep files focused. Split large route files into reusable components when a section repeats or grows complex.
- Prefer pure utility functions in `lib/` for formatting, normalization, slugs, and money/currency behavior.
- Prefer semantic HTML and accessible labels for navigation, forms, filters, tables, cards, dialogs, and buttons.
- Avoid duplicating server/data access logic across pages. Extract reusable query helpers when a query is needed in more than one place.
- Keep loading, empty, and error states explicit for user-facing data flows.
- Keep Tailwind classes readable and consistent: layout, spacing, sizing, typography, colors, borders, states.

## UI update workflow

- Read `DESIGN.md` and `docs/brand-ui-guidelines.md` first.
- Reuse existing cards, buttons, filters, state messages, breadcrumbs, price text, header/footer, and admin shells when possible.
- Preserve compact marketplace density: product grids should stay scannable and responsive.
- Support Armenian text length and AMD currency formatting.
- Take a screenshot for perceptible runnable web application changes when practical.

## Database and Supabase workflow

- Read `docs/supabase-guidelines.md` first.
- Create a new migration for schema changes; do not rewrite existing applied migrations unless explicitly requested.
- Design queries around public marketplace read performance, admin management flows, and merchant ownership boundaries.
- Add indexes for common filters, joins, sorting, and lookup paths.
- Keep RLS policies explicit and least-privilege.
- Validate assumptions against existing migrations before changing schema or access rules.

## Quality checklist before finishing

- Relevant docs were checked.
- Existing conventions were reused.
- Components are small, reusable, and appropriately placed.
- UI follows documented tokens and responsive rules.
- Supabase changes include migrations, RLS, and indexes when needed.
- TypeScript compiles or any failure is documented.
- Final response lists changed files and exact checks run.
