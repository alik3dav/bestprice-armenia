# Testing Standards

Use the lightest test that proves the behavior, then add broader tests for critical flows. Unit tests should cover pure utilities, formatting, validation, slugs, auth helpers, and data transforms. Integration tests should cover server actions, Supabase query helpers, forms, and route-level data behavior. E2E tests should cover public search/filter/product comparison and admin/merchant critical paths when an E2E framework is present.

Coverage targets: critical utilities and security-sensitive validation should be near-complete; public shopping and admin mutation flows require regression coverage as they mature. Every bug fix should include a test or a documented reason why automated coverage is not practical yet.

Baseline command for code changes is `npm run typecheck`. Run `npm run build` for production-impacting changes. Add or update test scripts before relying on manual-only validation for recurring behavior.
