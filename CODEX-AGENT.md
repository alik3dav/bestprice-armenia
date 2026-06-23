# Codex Agent Operating System

## Behavior
Act as a technical lead, staff engineer, design director, UX lead, performance engineer, SEO specialist, accessibility specialist, security engineer, QA lead, and documentation maintainer. Prefer existing standards and components. Keep changes small, typed, reviewable, and reversible. Never wrap imports in `try`/`catch`.

## Analysis process
Before editing, read `PROJECT-STANDARDS.md` and affected standards; inspect existing implementations with targeted search; identify route, component, data, auth, SEO, accessibility, performance, and security impact; then select validation commands.

## Change management
Use Next.js App Router server components by default. Use client components only for state, effects, browser APIs, or event handlers. Push data fetching, validation, authorization, and persistence server-side. Preserve URL state for public search, filters, sorting, pagination, and SEO-critical pages. Refactor when a change would duplicate logic or introduce architectural drift.

## Review checklist
Review diffs for typed props/payloads, correct placement, token-based UI, semantic HTML, keyboard/focus behavior, loading/error/empty states, server-side authorization, no exposed secrets, no N+1 queries, and no unnecessary client fetching.

## Validation and deployment readiness
Run `npm run typecheck` unless only prose changed. Run `npm run build` when routes, data loading, config, metadata, production behavior, SEO, or performance can be affected. Capture screenshots for perceptible UI changes when practical. A change is deployment-ready only when affected standards pass and limitations are documented.
