# Supabase and Database Guidelines

Use this file before changing Supabase clients, auth, migrations, RLS policies, storage policies, or data-access queries.

## Database principles

- Treat the database as the source of truth for products, categories, merchants, offers, profiles, roles, specifications, and marketplace availability.
- Keep migrations append-only. Add a new numbered migration for schema changes instead of editing existing migrations unless explicitly requested.
- Design for fast product discovery: category browsing, search, filtering, sorting by price, merchant offer comparison, and product detail pages.
- Keep public read paths efficient and admin/merchant write paths protected.

## Migration rules

- Use clear, incremental migration names.
- Include constraints for required relationships and valid enum-like values.
- Add indexes for expected query paths, including:
  - product/category lookup and slug lookup
  - active products and active offers
  - merchant ownership lookups
  - category hierarchy paths
  - commonly filtered specification values when they become filterable
  - price sorting and best-offer queries
- Prefer deterministic SQL that can run on a fresh database.
- Keep destructive migrations explicit and rare.

## RLS and authorization

- RLS must remain enabled for user-owned or role-sensitive tables.
- Public users may read only active/published marketplace data intended for the storefront.
- Admin users may manage marketplace data according to role checks.
- Merchant users may access only their own merchant records and offers unless a policy explicitly allows more.
- Storage policies must match the same access model as table policies.
- Never rely on client-side checks alone for role or ownership protection.

## Supabase client usage

- Use `lib/supabase/server.ts` for server-side user/session-aware access.
- Use `lib/supabase/admin.ts` only for trusted server-only admin operations that require service-role privileges.
- Use `lib/supabase/client.ts` only for browser-side interactions.
- Never expose service-role keys to client components.
- Keep Supabase query code close to the route or extract it into a small typed helper when reused.

## Query design

- Select only columns needed by the UI.
- Use stable ordering for lists and admin tables.
- Use pagination or limits for product grids and admin tables.
- Prefer database-side filtering/sorting for category, search, price, availability, and merchant offer lists.
- Keep AMD currency handling consistent with `lib/money.ts` and existing platform-currency migrations.

## Forms and validation

- Validate server-action payloads with typed schemas where practical.
- Normalize slugs, empty strings, optional URLs, prices, and numeric fields before writing.
- Return user-friendly errors while avoiding leakage of sensitive database details.
- Keep create/edit forms aligned with schema constraints.

## Review checklist

- A migration exists for schema changes.
- RLS policies still match public/admin/merchant access needs.
- Indexes support new read or write paths.
- Queries avoid N+1 patterns and select only needed columns.
- Service-role usage is server-only and justified.
