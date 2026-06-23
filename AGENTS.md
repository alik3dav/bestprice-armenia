# BestPrice Armenia Agent Instructions

These instructions apply to the entire repository.

## Mandatory reading order

1. `AGENTS.md` (this file).
2. `PROJECT-STANDARDS.md` for the master governance hierarchy and enforcement workflow.
3. `CODEX-AGENT.md` for AI agent operating behavior.
4. All domain standards referenced by `PROJECT-STANDARDS.md` that are affected by the task.
5. `QA-CHECKLIST.md` before final validation.

Compatibility files (`CODEX.md`, `DESIGN.md`, and `docs/*-guidelines.md`) remain useful summaries, but the new standards system is authoritative when rules overlap. Follow the stricter rule.

## Product context

BestPrice Armenia is a price-comparison and product-discovery marketplace for Armenia. Changes must optimize for fast scanning, search-first shopping flows, dense but readable product information, trustworthy merchant/product data, and Armenian-first localization with Russian and English compatibility.

## Non-negotiable rules

- Keep changes component-based, reusable, typed, and split into focused files.
- Prefer shared components and variants over copied markup or repeated Tailwind strings.
- Preserve the Next.js App Router structure and use server components by default unless interactivity requires a client component.
- Keep client components small and push data fetching, validation, authorization, and persistence server-side where practical.
- Do not add new UI colors, spacing, card styles, button styles, layout patterns, or component variants unless documented in the relevant standards file first.
- Keep Supabase schema changes migration-first, RLS-safe, indexed for marketplace queries, and compatible with public/admin/merchant access boundaries.
- Never put `try`/`catch` blocks around imports.

## Required checks

Run the most relevant checks after changes. For code changes, prefer at minimum `npm run typecheck`; run `npm run build` when routes, data loading, Next config, metadata, SEO, performance, or production behavior changed. Document environment limitations in the final response.
