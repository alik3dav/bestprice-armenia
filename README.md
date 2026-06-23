# BestPrice Armenia

BestPrice Armenia is an Armenian-first price-comparison and product-discovery marketplace built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

## Stack

- Next.js App Router + TypeScript
- Supabase Auth, PostgreSQL, Storage, and RLS
- Tailwind CSS with reusable marketplace/admin components
- shadcn/ui-ready component structure where applicable

## Governance-first development

Before making repository changes, start with `PROJECT-STANDARDS.md`. It defines the document hierarchy, rule precedence, enforcement workflow, and quality bar. AI agents must also read `AGENTS.md`, `CODEX-AGENT.md`, affected domain standards, and `QA-CHECKLIST.md`.

Key standards include:

- `DESIGN-SYSTEM.md`, `UX-STANDARDS.md`, `COMPONENT-STANDARDS.md`
- `ARCHITECTURE.md`, `API-STANDARDS.md`, `STATE-MANAGEMENT.md`, `ERROR-HANDLING.md`
- `PERFORMANCE.md`, `SEO.md`, `ACCESSIBILITY.md`, `SECURITY.md`
- `TESTING-STANDARDS.md`, `DOCUMENTATION-STANDARDS.md`, `CONTENT-STANDARDS.md`
- `PRODUCT-STANDARDS.md`, `CONVERSION-STANDARDS.md`

## Implemented MVP foundation

- Auth login screen and Supabase password sign-in.
- Admin-only route protection with server-side role checks.
- Dense desktop-oriented admin layout with sidebar and topbar.
- CRUD-ready admin modules for dashboard, products, categories, merchants, users, offers, and specification templates.
- Database-first schema in `supabase/migrations/0001_mvp_schema.sql`.
- RLS policies for admin access, merchant ownership, and public active-data reads.

## Development

Copy `.env.example` to `.env.local` and set Supabase values.

Common commands:

```bash
npm run typecheck
npm run build
npm run dev
```

## Quality gate

No task is complete until applicable standards are checked, relevant automated checks run, limitations reported, and notable governance/product changes documented in `CHANGELOG.md`.
