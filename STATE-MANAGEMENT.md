# State Management Standards

Prefer server-rendered data and URL state. Public search, filters, sort, pagination, category selections, and shareable views should live in URLs where practical. Local component state is acceptable for transient UI such as open drawers, tabs, pending form state, and menus.

Do not add global state libraries without documenting the use case, ownership model, performance impact, and alternatives considered. Shared mutable state must have a single owner, predictable updates, and clear reset behavior on navigation or auth changes.
