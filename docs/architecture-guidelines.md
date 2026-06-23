# Architecture Guidelines

This compatibility guide supports `ARCHITECTURE.md`, `COMPONENT-STANDARDS.md`, `API-STANDARDS.md`, `STATE-MANAGEMENT.md`, `ERROR-HANDLING.md`, and `PERFORMANCE.md`.

## Core rules

- Keep routes in `app/` focused on composition, metadata, loading/error boundaries, and route-level data orchestration.
- Keep reusable marketplace UI in `components/public/` and admin UI in `components/admin/`.
- Put shared formatting, slugs, money, auth guards, i18n, and query helpers in `lib/`.
- Put Supabase clients only in `lib/supabase/` and auth/role protection in `lib/auth/`.
- Use server components by default; client components only for interactivity.
- Avoid importing server-only utilities into client components.

## Reuse and data flow

Before adding components or helpers, inspect existing patterns. Extract reusable variants for repeated product cards, price rows, breadcrumbs, filters, forms, table shells, buttons, badges, and state messages. Public SEO pages should avoid unnecessary client fetching, select only needed columns, paginate large lists, and avoid N+1 queries.

## Review checklist

Route files are not overloaded; components are placed correctly; repeated patterns are reused; public pages remain search-first and responsive; admin/merchant areas remain dense; data flow is typed, authorized, and performant.
