# Component Standards

Components must be focused, typed, reusable, and placed by ownership: `components/public`, `components/admin`, or shared primitives only when reuse is real. Route files should compose and orchestrate, not duplicate large JSX blocks.

Prefer server components. Use client components only for interactivity. Create prop-driven variants for repeated cards, buttons, badges, filters, tables, forms, and state messages. Use URL state for public search/filter/sort/pagination.

User-facing async components must define loading, error, empty, disabled, and success states as relevant. Loading states reserve final layout; errors are recoverable and accessible; empty states explain the condition and next action.

New reusable components need clear prop types. Complex logic deserves concise comments; obvious markup does not. New reusable variants must be documented in this file or the related design/UX standard.

`components/public/header/` owns focused pieces of the public header: the logo, search form, action group, navigation, and link data. `PublicHeader` is the small client-side coordinator for search, authentication, and account-menu state; presentational header pieces receive typed props and do not own routing or auth side effects.
