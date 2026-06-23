# Documentation Standards

Documentation must be accurate, enforceable, and easy for future agents and humans to follow. Prefer one authoritative standard per domain with compatibility guides pointing to it. Remove contradictions instead of adding more prose.

READMEs should explain project purpose, stack, setup, scripts, and governance entry points. API/data documentation should define inputs, outputs, auth requirements, validation, errors, and side effects. Comments should explain non-obvious decisions, constraints, or security/performance tradeoffs; do not comment obvious code.

Notable architecture, design, performance, SEO, accessibility, security, database, and governance changes must be recorded in `CHANGELOG.md`. When standards change, include why the rule exists and how to validate compliance.
