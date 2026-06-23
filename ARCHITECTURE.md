# Architecture Standards

## Stack and structure
Next.js App Router + TypeScript, Tailwind CSS, Supabase PostgreSQL/Auth/Storage/RLS. `app/` owns routes, layouts, metadata, loading/error states. `components/public/` owns marketplace UI, `components/admin/` admin UI, `components/ui/` low-level primitives when present, `lib/` shared utilities, `lib/supabase/` Supabase clients only, `lib/auth/` guards, `supabase/migrations/` append-only migrations, and `docs/` supporting guidance.

## Naming and data flow
Use PascalCase component exports, clear utility names, lowercase stable route segments, and descriptive ordered migrations. Server components/actions own validation, authorization, and writes. Public SEO pages should not depend on unnecessary client fetching. Shared query helpers must be typed, select only needed columns, and avoid N+1 behavior.

## Dependencies and refactoring
Add dependencies only when maintained and justified. Avoid packages for trivial utilities. Do not import server-only modules into client components. Service-role Supabase clients are server-only. Refactor scoped duplication and architectural drift while preserving behavior unless the task requires a behavior change.
