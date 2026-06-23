# API Standards

Server actions, route handlers, and data helpers must define typed inputs, validation, authorization, normalized outputs, and safe errors. Use Zod or typed schemas where practical. Mutations must check role/ownership server-side and return user-friendly errors without leaking internals.

Public data APIs should paginate, filter server-side, select only needed fields, and avoid N+1 queries. Admin/merchant APIs must audit sensitive mutations when audit infrastructure exists. API naming should be stable, domain-oriented, and independent of UI implementation details.
