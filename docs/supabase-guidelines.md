# Supabase and Database Guidelines

Use this file with `SECURITY.md`, `API-STANDARDS.md`, `ARCHITECTURE.md`, and `PERFORMANCE.md` before changing Supabase clients, auth, migrations, RLS policies, storage policies, or data-access queries.

## Database principles

The database is the source of truth for products, categories, merchants, offers, profiles, roles, specifications, and availability. Migrations are append-only unless explicitly instructed otherwise. Public read paths must be fast; admin and merchant write paths must be protected.

## Migration and query rules

Use clear incremental migration names, constraints for relationships and enum-like values, indexes for lookup/filter/sort/ownership paths, deterministic SQL, and explicit rare destructive changes. Select only needed columns, use stable ordering, pagination/limits, database-side filtering/sorting, and avoid N+1 behavior.

## RLS and authorization

RLS must remain enabled for user-owned or role-sensitive tables. Public users may read only active/published storefront data. Admin users may manage data according to role checks. Merchant users may access only their own merchant records and offers. Storage policies must match table access. Never rely on client-side checks alone.

## Supabase clients

Use `lib/supabase/server.ts` for server-side user/session-aware access, `lib/supabase/admin.ts` only for trusted server-only service-role operations, and `lib/supabase/client.ts` only for browser interactions. Never expose service-role keys to client components.

## Forms and validation

Validate server-action payloads with typed schemas where practical. Normalize slugs, empty strings, URLs, prices, and numeric fields before writing. Return user-friendly errors without leaking sensitive database details.

## Review checklist

Schema changes have migrations; RLS remains least-privilege; indexes support new paths; queries avoid N+1 and over-selection; service-role usage is server-only and justified.
