# Architecture Guidelines

Use this file before changing application structure, route composition, reusable components, utilities, or data-flow patterns.

## Goals

- Keep the marketplace fast, maintainable, and easy to extend.
- Use small reusable components rather than page-level monoliths.
- Keep route files focused on composition and data orchestration.
- Keep shared business logic in `lib/` and shared UI in `components/`.

## File structure rules

### Routes

- `app/page.tsx` and nested `app/**/page.tsx` files should compose sections and load route data.
- Use `loading.tsx` and `error.tsx` for routes with meaningful async work.
- Keep route groups clear:
  - `(admin)` for admin-only pages.
  - `(merchant)` for merchant dashboard pages.
  - `(auth)` for authentication screens.
  - public routes outside groups for marketplace pages.

### Components

- Put public marketplace components in `components/public/`.
- Put admin dashboard components in `components/admin/`.
- If a component is shared across public/admin/merchant areas, create or move it to a neutral shared component location only when reuse is real.
- Split components by responsibility:
  - layout shell
  - section wrapper
  - list/grid
  - card/row
  - form fields/actions
  - loading/empty/error state
- Prefer prop-driven variants over separate near-identical components.
- Do not copy large component blocks between public, admin, and merchant routes. Extract a reusable component or utility instead.

### Utilities and data helpers

- Put shared formatting in `lib/`, for example money, slug, i18n, and class merging utilities.
- Put Supabase client creation in `lib/supabase/` only.
- Put auth/role protection in `lib/auth/`.
- Avoid importing route-specific code into shared utilities.

## Component design rules

- Components should have typed props and predictable defaults.
- Keep client components minimal and only use `"use client"` when state, effects, browser APIs, or event handlers are required.
- Favor server components for data-loaded marketplace pages.
- Prefer composition over configuration objects when sections need custom layout.
- Add empty/loading/error states near the component that owns the UI state.
- Keep accessibility built in: semantic elements, labels, focus states, keyboard navigation, and useful ARIA only when native HTML is insufficient.

## Reuse expectations

Before adding a component, check for existing patterns in:

- `components/public/`
- `components/admin/`
- `app/**/loading.tsx`
- `app/**/error.tsx`
- `lib/`

Create reusable variants for repeated product cards, price rows, breadcrumbs, filters, forms, table shells, buttons, badges, and state messages.

## Performance expectations

- Avoid unnecessary client-side fetching for SEO-critical public pages.
- Keep product listing and detail pages cache-aware and data-efficient.
- Select only needed Supabase columns.
- Avoid N+1 data loading patterns; use joins, views, or batched queries when practical.
- Keep image rendering predictable with explicit dimensions, responsive sizes, and appropriate `object-fit`.

## Review checklist

- Route files are not overloaded with repeated markup.
- New components are placed in the correct folder.
- Reused patterns were considered before new patterns were introduced.
- Public marketplace pages remain search-first, compact, and responsive.
- Admin and merchant areas keep dense dashboard behavior.
