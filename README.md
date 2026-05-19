# BestPrice Armenia MVP Foundation

## Stack
- Next.js App Router + TypeScript
- Supabase (auth, PostgreSQL, RLS)
- Tailwind CSS + reusable admin UI shells
- shadcn/ui-ready component structure (`components/ui` + compact dashboard patterns)

## Implemented MVP Foundation
- Auth login screen and Supabase password sign-in.
- Admin-only route protection with server-side role checks.
- Dense desktop-oriented admin layout with sidebar + topbar.
- CRUD-ready admin modules: dashboard, products, categories, merchants, users, offers, specification templates.
- Database-first schema in `supabase/migrations/0001_mvp_schema.sql` covering:
  - profiles, roles, categories, brands, products, merchants, product_offers
  - specification_groups, specification_fields, product_specification_values
- RLS policies for:
  - full admin access
  - merchant ownership over own offers
  - public active-data read model for future frontend

## Next steps
- Wire each admin section to Supabase queries/actions.
- Add create/edit forms (dialog or route-level) and destructive-action confirmation dialogs.
- Add server actions, pagination, sort, and filter query params.
- Add audit metadata and optional soft-delete columns.
- Build public SEO product pages using active products + grouped specifications + lowest-price sorted offers.

## Environment
Copy `.env.example` to `.env.local` and set Supabase values.
