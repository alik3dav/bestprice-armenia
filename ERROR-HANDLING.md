# Error Handling Standards

Errors must be actionable, safe, and accessible. User-facing messages should explain recovery steps without leaking stack traces, SQL details, secrets, or authorization internals. Admin errors may be more specific but must remain safe.

Every async user flow needs explicit loading, error, and empty states. Server actions should return structured results for expected validation/business errors and throw only for unexpected failures. Route-level `error.tsx` and `loading.tsx` should be used for meaningful async routes.

Log unexpected errors where infrastructure exists, include enough context to debug, and avoid logging sensitive payloads or credentials.
