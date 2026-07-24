# Component Standards

Components must be focused, typed, reusable, and placed by ownership: `components/public`, `components/admin`, or shared primitives only when reuse is real. Route files should compose and orchestrate, not duplicate large JSX blocks.

Prefer server components. Use client components only for interactivity. Create prop-driven variants for repeated cards, buttons, badges, filters, tables, forms, and state messages. Use URL state for public search/filter/sort/pagination.

User-facing async components must define loading, error, empty, disabled, and success states as relevant. Loading states reserve final layout; errors are recoverable and accessible; empty states explain the condition and next action.

New reusable components need clear prop types. Complex logic deserves concise comments; obvious markup does not. New reusable variants must be documented in this file or the related design/UX standard.

`ProductGridCard` is the shared public product-card pattern. It uses a stable square image area, a two-line title, rating state, best-price and store-count metadata, and a full-width offer CTA; category and search grids must reuse it rather than duplicating product-card markup.

`components/public/header/` owns focused pieces of the public header: the logo, search form, action group, navigation, and link data. `PublicHeader` is the small client-side coordinator for search, authentication, and account-menu state; presentational header pieces receive typed props and do not own routing or auth side effects.

`HomePromotionHero` owns the homepage promotional-banner composition: a horizontally scrollable set of featured category links and two typed, image-ready promotional links. Keep banner content and destinations as data-driven props rather than duplicating hero markup in the route.

`HomeSectionHeading` owns the shared homepage section title and optional navigational action. `HomeCategoryStrip` uses the documented compact category-tile variant for up to eight popular category links, while `DailyProductOffersSection` composes the shared `ProductGridCard` into the homepage's five-column offer grid.
