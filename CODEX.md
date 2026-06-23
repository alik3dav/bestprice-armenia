# Codex Compatibility Guide

The authoritative AI operating guide is `CODEX-AGENT.md`; the authoritative master workflow is `PROJECT-STANDARDS.md`. This file remains as a short compatibility summary for agents that still look for `CODEX.md`.

## Workflow summary

- Read `AGENTS.md`, `PROJECT-STANDARDS.md`, `CODEX-AGENT.md`, and affected domain standards before editing.
- Inspect existing implementations before creating new patterns.
- Keep changes small, typed, reusable, and reviewable.
- Use server components by default and keep client components minimal.
- Preserve marketplace density, Armenian-first localization, public SEO, accessibility, performance, and security.
- Use `docs/supabase-guidelines.md` and `SECURITY.md` before database, auth, RLS, storage, or Supabase client work.

## Quality gates

- Validate against `QA-CHECKLIST.md`.
- Run `npm run typecheck` for code changes unless only prose changed.
- Run `npm run build` for route, data loading, config, metadata, SEO, performance, or production-impacting changes.
- Report changed files, checks run, limitations, and standards compliance.
