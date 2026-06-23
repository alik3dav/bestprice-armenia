# Security Standards

Every update must preserve or improve security. Authentication and authorization must be enforced server-side. Admin and merchant access require role/ownership checks; client-side checks are never sufficient. Supabase RLS must remain least-privilege and enabled for sensitive tables.

Validate and normalize all persisted input with typed schemas where practical. Sanitize user-rendered content and avoid unsafe HTML. Never expose service-role keys, secrets, tokens, or private environment values to client bundles or logs. Keep secrets in environment variables and `.env.local` only.

Use secure dependency management: avoid abandoned packages, review new packages, and prefer built-in platform features. Security headers, HTTPS assumptions, cookie flags, CSRF-safe mutation patterns, rate limiting for sensitive actions, and OWASP Top 10 risks must be considered for auth, forms, uploads, and admin workflows.
