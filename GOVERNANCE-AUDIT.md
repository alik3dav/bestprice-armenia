# Markdown Governance Audit

## Scope
Audited repository-authored markdown files: `AGENTS.md`, `CODEX.md`, `DESIGN.md`, `README.md`, `docs/brand-ui-guidelines.md`, `docs/architecture-guidelines.md`, and `docs/supabase-guidelines.md`. Dependency markdown under `node_modules/` is intentionally excluded because it is third-party package documentation.

## Findings
- `AGENTS.md` and `CODEX.md` overlapped on reading order, workflow, and quality checks, but lacked a master standards hierarchy.
- `DESIGN.md` used a Wise-inspired fintech palette that conflicted with the marketplace red/compact product guidance in `docs/brand-ui-guidelines.md`.
- Existing docs had strong UI, architecture, and Supabase guidance but missing dedicated standards for performance, SEO, accessibility, security, content, testing, documentation, conversion, API design, state, and error handling.
- Enforcement was vague: checks were recommended but not tied to a single QA checklist or mandatory compliance report.
- README described the MVP but did not clearly point all contributors to the governance system.

## Restructure performed
- Added `PROJECT-STANDARDS.md` as the master entry point.
- Added domain standards for agent behavior, design, UX, components, architecture, performance, SEO, accessibility, security, content, QA, testing, documentation, marketplace product quality, conversion, APIs, state, and error handling.
- Converted legacy files into compatibility entry points where appropriate and aligned precedence around the new governance hierarchy.
