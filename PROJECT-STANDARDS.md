# Project Standards System

BestPrice Armenia is an Armenian-first price-comparison and product-discovery marketplace. This is the mandatory entry point for every future task and governs design quality, code quality, architecture consistency, performance, SEO, accessibility, security, scalability, maintainability, and documentation quality.

## Mandatory reading order
1. `AGENTS.md`.
2. `PROJECT-STANDARDS.md`.
3. `CODEX-AGENT.md`.
4. Affected domain files: `ARCHITECTURE.md`, `COMPONENT-STANDARDS.md`, `DESIGN-SYSTEM.md`, `UX-STANDARDS.md`, `PERFORMANCE.md`, `SEO.md`, `ACCESSIBILITY.md`, `SECURITY.md`, `TESTING-STANDARDS.md`, `DOCUMENTATION-STANDARDS.md`, `CONTENT-STANDARDS.md`, `PRODUCT-STANDARDS.md`, `CONVERSION-STANDARDS.md`, `API-STANDARDS.md`, `ERROR-HANDLING.md`, `STATE-MANAGEMENT.md`, and `docs/supabase-guidelines.md` when data/Supabase/auth is affected.
5. `QA-CHECKLIST.md` before final validation.
6. `CHANGELOG.md` for notable architectural, design, performance, SEO, accessibility, security, or governance changes.

## Precedence
Direct instructions > scoped `AGENTS.md` > this file > domain standards > compatibility guides (`CODEX.md`, `DESIGN.md`, `docs/*-guidelines.md`) > existing code conventions. Follow the stricter rule when two rules overlap.

## Enforcement workflow
For every task: read required standards, identify affected rules, inspect existing patterns, choose the smallest safe change, implement with reusable typed patterns, validate against the QA checklist, run relevant checks, report compliance and violations, and update standards when a recurring risk is discovered.

## Non-negotiable quality bar
Every update must preserve or improve search-first shopping flows, Armenian/Russian/English localization resilience, reusable components, type safety, least-privilege data access, Core Web Vitals, semantic accessibility, metadata and structured SEO, security posture, and documentation clarity.

## Continuous improvement
When an inconsistency, regression, or missing rule is discovered, update the relevant standards file with prevention and validation guidance so the repository becomes more robust after every update.
