# Changelog

## 2026-07-23

### Design and architecture
- Added a reusable homepage community-subscription and popular-search section directly above the public footer, with an empty image-source placeholder for a future campaign asset.
- Replaced the data-fetching public footer with a responsive PriceMaster AM footer containing marketplace, company, legal, and merchant CTA sections.
- Replaced the homepage text-led hero with a reusable promotional hero that keeps featured-category links above two responsive campaign links and gray image placeholders.
- Redesigned the public marketplace header as a responsive two-row, search-first navigation pattern.
- Split the header into focused logo, search, action, navigation, and link-data components while keeping client-side state in a small coordinator.
- Redesigned the shared public product card to improve price, offer-count, and offer-CTA scanning across search, category, and latest-product grids.

## 2026-06-23

### Governance
- Created the AI-governed project standards system with `PROJECT-STANDARDS.md` as the master entry point.
- Added domain standards for Codex agents, design, UX, components, architecture, performance, SEO, accessibility, security, content, QA, testing, documentation, product marketplace behavior, conversion, APIs, state management, and error handling.
- Added `GOVERNANCE-AUDIT.md` documenting the markdown audit findings and restructuring decisions.

### Documentation
- Aligned legacy guidance files to the new standards hierarchy and clarified that stricter domain standards take precedence.
