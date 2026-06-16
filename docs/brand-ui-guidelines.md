# Brand UI Guidelines

This document is the single source of truth for the marketplace UI. Always read and follow it before making UI, UX, layout, component, page, marketplace, category, product, filter, search, banner, review, or responsive changes.

## 1. Product and Design Principles

### Product context

BestPrice Armenia is an Armenia-based price comparison and product discovery marketplace. The interface should feel like a practical e-commerce comparison website: fast to scan, search-first, information-dense, trustworthy, and localization-ready for Armenian market needs.

### Design direction

- Use a clean, practical marketplace UI.
- Prioritize light theme first.
- Build with neutral white and gray backgrounds.
- Keep product cards compact and dense but readable.
- Make search the primary action in the header.
- Keep category navigation clear and easy to scan.
- Prefer borderless surfaces, soft background separation, minimal shadows, and subtle rounded corners.
- Create a professional e-commerce feeling, not a luxury SaaS landing page.
- Prepare all patterns for Armenian, Russian, and English text lengths.
- Avoid dark theme as the default.
- Avoid oversized spacing, nested bordered panels, and excessive section padding.
- Avoid playful gradients.
- Avoid childish rounded UI.
- Avoid one-off visual patterns that cannot scale across categories and product pages.

## 2. Layout System

### Page shell

- Center all primary content.
- Main content max width: `1180px` to `1240px`.
- Recommended default container: `max-width: 1200px`.
- Use responsive horizontal padding:
  - Mobile: `12px` to `16px`
  - Tablet: `16px` to `20px`
  - Desktop: `20px` to `24px`
- Keep vertical spacing compact and predictable.
- Prefer repeated section spacing over unique page-level spacing.

### Grid

- Use a 12-column responsive grid for major layouts.
- Use consistent gutters:
  - Mobile: `8px` to `12px`
  - Tablet: `12px` to `16px`
  - Desktop: `16px` to `20px`
- Category and search result pages:
  - Desktop: left filter sidebar + product grid.
  - Filter sidebar: `220px` to `260px` wide.
  - Product grid area fills remaining width.
- Product grids:
  - Desktop: 5 columns.
  - Tablet: 3 columns.
  - Mobile: 2 columns.
- Product detail pages:
  - Product media on the left.
  - Product information in the center.
  - Price/store summary on the right.
  - Stack sections vertically on mobile in this order: media, title/summary, best price CTA, store offers, specs/reviews/related.

### Spacing scale

Use a compact marketplace spacing scale:

| Token | Size | Use |
| --- | ---: | --- |
| `--space-1` | `4px` | Tight inline spacing, icon gaps |
| `--space-2` | `8px` | Card internals, compact gaps |
| `--space-3` | `12px` | Default component padding |
| `--space-4` | `16px` | Section internals, grid gaps |
| `--space-5` | `20px` | Page section spacing |
| `--space-6` | `24px` | Major desktop section spacing |
| `--space-8` | `32px` | Large separators only |

Do not introduce random spacing values unless the value becomes a documented token.

## 3. Color Tokens

Use mostly neutral colors. Brand red is reserved for important actions, logo areas, badges, and highlights. Do not introduce new colors unless they are added here first.

```css
:root {
  --color-page-bg: #f3f5f7;
  --color-surface: #ffffff;
  --color-surface-elevated: #ffffff;
  --color-border: #d9dee5;
  --color-border-muted: #e8ebef;

  --color-text-primary: #1f2933;
  --color-text-secondary: #52616f;
  --color-text-muted: #8a96a3;

  --color-brand-red: #e30613;
  --color-brand-red-hover: #c9000b;

  --color-success-green: #16a34a;
  --color-warning-orange: #f59e0b;
  --color-rating-orange: #f6a400;
  --color-link-blue: #2563eb;
  --color-discount-red: #dc2626;
  --color-price-text: #111827;
}
```

### Color usage rules

- Page background: use `--color-page-bg`.
- Cards, panels, filters, menus, and tables: use `--color-surface`.
- Sticky or floating layers: use `--color-surface-elevated`; add a thin border only when needed for readability.
- Default borders: use `--color-border`.
- Internal dividers: use `--color-border-muted`.
- Main text: use `--color-text-primary`.
- Supporting metadata: use `--color-text-secondary`.
- De-emphasized metadata and placeholders: use `--color-text-muted`.
- Primary CTAs, logo highlights, key badges: use `--color-brand-red`.
- Prices: use `--color-price-text` and strong font weight.
- Discounts: use `--color-discount-red`.
- Ratings: use `--color-rating-orange`.
- In-stock or positive status: use `--color-success-green`.
- Warnings, limited stock, or attention states: use `--color-warning-orange`.
- Links: use `--color-link-blue`.

## 4. Typography

### Font stack

Use a modern sans-serif font with strong multilingual support.

```css
font-family: Inter, "Noto Sans Armenian", "Noto Sans", Arial, sans-serif;
```

### Type scale

| Element | Size | Weight | Line height |
| --- | ---: | ---: | ---: |
| Base body text | `14px` | `400` | `1.4` |
| Small metadata | `12px` to `13px` | `400` | `1.35` |
| Filter labels | `13px` | `400` to `500` | `1.3` |
| Product card title | `13px` to `14px` | `500` | `1.35` |
| Section title | `16px` to `20px` | `600` | `1.3` |
| Page title | `22px` to `28px` | `600` to `700` | `1.25` |
| Product detail title | `22px` to `26px` | `600` | `1.25` |
| Product card price | `16px` to `18px` | `700` | `1.2` |
| Product detail price | `20px` to `22px` | `700` | `1.2` |

### Typography rules

- Avoid huge marketing-style headings inside marketplace pages.
- Product titles should be readable but compact.
- Price must be visually stronger than metadata.
- Use numeric alignment where useful in price tables.
- Support longer Armenian labels without breaking layout.
- Never rely on uppercase-only text for important Armenian content.

## 5. Radius, Borders, and Shadows

```css
:root {
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --shadow-subtle: 0 1px 2px rgba(15, 23, 42, 0.06);
}
```

- Default card radius: `6px`.
- Small controls and badges: `4px`.
- Larger panels and banners: `8px`.
- Prefer borderless cards and panels separated by background tone, whitespace, or typography.
- Use borders only for inputs, tables, dividers, dropdowns, drawers, active/focus states, and places where hierarchy would otherwise be unclear.
- Avoid nested bordered sections; do not wrap every section, card, chip, and image with its own border.
- Use shadows sparingly and only for dropdowns, drawers, sticky overlays, and elevated interactive surfaces.
- Do not use heavy card shadows.

## 6. Core Components

### Header

- Header must be search-first.
- Desktop header structure:
  - Logo on the left.
  - Large central search bar.
  - Compact user actions on the right.
- Header should remain visually light with a white surface; use a bottom border only if separation is unclear.
- Use brand red for the logo area and primary search action only.
- Keep header height compact: `56px` to `72px` on desktop.
- Mobile header should prioritize logo and search, with secondary actions moved to compact icons or menus.

### Search bar

- Search is the primary action.
- Search input must be large enough to dominate the header but not oversized.
- Recommended desktop height: `40px` to `44px`.
- Recommended mobile height: `38px` to `42px`.
- Use clear placeholder text that supports localization.
- Search button should use brand red or a strong neutral style.
- Autocomplete dropdowns should use a white surface, compact rows, and highlighted query matches; add a thin border only when needed.
- Search results should include product, category, and store suggestions when available.

### Category tabs and navigation

- Category navigation must be easy to scan.
- Use compact horizontal tabs, dropdown mega menus, or icon categories depending on viewport.
- Keep category labels short where possible.
- Use neutral text by default and brand red only for active or promotional categories.
- Mobile category navigation may use horizontal scrolling chips or a drawer.

### Breadcrumbs

- Use breadcrumbs on category and product detail pages.
- Style breadcrumbs as small metadata text, `12px` to `13px`.
- Use muted text for ancestors and primary text for the current page.
- Keep separators subtle.

### Product card

Product cards must include:

- Image area with a consistent aspect ratio.
- Product title with max 2 lines.
- Rating row.
- Price.
- Store count or availability.
- Optional discount badge.
- Optional favorite and compare actions.
- Very subtle border.
- White background.
- Compact padding.
- No heavy shadows.

Recommended card structure:

1. Image area.
2. Badge/action overlay row.
3. Product title.
4. Rating and review count.
5. Price.
6. Store count / availability.
7. Optional compact CTA or compare affordance.

Product card rules:

- Background: `--color-surface`.
- Border: `1px solid var(--color-border-muted)`.
- Radius: `--radius-md`.
- Padding: `8px` to `12px`.
- Image area aspect ratio: `1 / 1` or `4 / 3`, consistent per grid.
- Image object fit: `contain` for marketplace products.
- Title line clamp: 2 lines.
- Do not use large shadows on hover; use border color or subtle shadow only.
- Keep favorite and compare actions small and secondary.

### Product grid

- Use 5 columns desktop, 3 tablet, 2 mobile.
- Maintain consistent card heights within sections where possible.
- Avoid oversized gaps that reduce product density.
- Use skeleton cards during loading.
- Use pagination or load-more consistently.

### Filter sidebar

- Filters are left sidebar on desktop.
- Filters open in a drawer on mobile.
- Filters must never visually dominate the product grid.
- Sidebar background: `--color-surface`.
- Sidebar border: `1px solid var(--color-border-muted)`.
- Use collapsible groups.
- Filter labels: `13px`.
- Group titles: `13px` to `14px`, medium weight.
- Keep controls compact and scannable.

Required filter types:

- Checkbox groups.
- Price range.
- Brand.
- Availability.
- Rating.
- Technical attributes.

Filter behavior rules:

- Show selected filters as removable chips above the grid.
- Include clear-all behavior.
- Persist applied filters in the URL where practical.
- On mobile, use a bottom filter/sort bar that opens drawers.
- Do not hide applied filter state inside collapsed UI only.

### Price comparison row

- Price comparison must be clear and fast to scan.
- Rows should emphasize store, price, delivery/availability, and CTA.
- Use table-like alignment on desktop.
- Use stacked cards on mobile.
- Price must be stronger than delivery and metadata.
- Store CTA buttons must be consistent across all rows.
- Use thin dividers between rows.
- Avoid decorative row backgrounds except for best offer or sponsored labels.

### Store row

- Store logo/name should be visible but not louder than price.
- Include rating or trust signal when available.
- Include availability and delivery notes.
- CTA label should be consistent, such as “Go to store” or the localized equivalent.
- Use brand red or a shared primary button variant for the main CTA.

### Rating stars

- Use `--color-rating-orange` for filled stars.
- Use muted border or muted text color for empty stars.
- Always pair ratings with numeric value or review count when available.
- Keep rating rows compact.

### Badges and discount labels

- Discount badges use `--color-discount-red`.
- Important marketplace badges may use brand red.
- Availability badges may use success green or neutral styling.
- Badges should be compact with `4px` radius.
- Do not create decorative badge colors outside the token system.

### Banners

- Banners should support promotional marketplace content without becoming playful or visually chaotic.
- Use restrained typography and clear CTAs.
- Use product or category imagery when useful.
- Avoid excessive gradients.
- Keep banners aligned to the same container system as the rest of the page.
- Homepage can include a larger hero banner, but category pages should use compact banners.

### Carousel sections

- Use carousel sections for featured categories, related products, recently viewed products, and store promotions.
- Cards inside carousels must use the same product card rules as grids.
- Navigation controls should be small and unobtrusive.
- Carousels must not hide critical content; key product lists should still be accessible.

### Product specs table

- Use a clean two-column table: attribute name and value.
- Group technical specs when categories are long.
- Use thin dividers and compact rows.
- Attribute labels use secondary text.
- Values use primary text.
- On mobile, preserve readability with stacked or full-width rows.

### Review cards

- Review cards use white surface, thin border, and compact padding.
- Show rating, reviewer name, date, review text, and optional pros/cons.
- Keep long reviews collapsed with “read more” behavior.
- Use verified or source badges only when meaningful.

### Pagination and load more

- Use one consistent pattern per page type.
- Product grids may use pagination for SEO-heavy category pages.
- Infinite loading must include a clear loading state and preserve browser navigation where possible.
- Load-more buttons should use neutral or primary shared button variants.

### Empty states

- Empty states should be helpful and compact.
- Include a clear message, suggested action, and optional reset-filters button.
- Avoid large illustrations unless they are shared assets and do not dominate the page.

### Skeleton loading states

- Use neutral gray skeleton blocks.
- Match the shape of the final content.
- Avoid animated effects that are too strong or distracting.
- Use skeleton product cards for grids and skeleton rows for comparison tables.

### Mobile bottom filter/sort bar

- Mobile category and search pages must include a compact bottom bar for filter and sort actions.
- The bar should be sticky at the bottom, with white background and top border.
- Use clear labels and icons.
- Opening filters should display a drawer with apply and reset actions.

## 7. Page Patterns

### Homepage

- Prioritize search, categories, promotional banners, featured products, popular categories, reviews/trust content, and footer.
- Use a strong but practical hero area.
- Keep homepage sections compact and marketplace-focused.
- Avoid turning homepage into a SaaS-style landing page.

### Category pages

- Desktop layout: filter sidebar left, product grid right.
- Include category title, breadcrumbs, sorting, selected filter chips, and product count.
- Include compact category descriptions for SEO without pushing products too far down.
- Use promotional banners sparingly.

### Product listing grids

- Use shared product card variants only.
- Maintain 5/3/2 responsive columns.
- Keep card density high while preserving readability.
- Sorting and selected filters should be visible above the grid.

### Product detail pages

- Desktop layout: media left, product info center, price/store summary right.
- Above the fold should show title, rating, media, best price, availability, and primary CTA.
- Store comparison table should be near the top and easy to scan.
- Product specs, reviews, price history, related products, and similar products should follow in clear sections.

### Store price comparison tables

- Emphasize price and CTA.
- Keep store metadata secondary.
- Use consistent row height and alignment.
- Mark best price clearly but subtly.
- Sponsored rows must be labeled.

### Footer

- Footer should be neutral, compact, and information-rich.
- Include key marketplace links, categories, company/help links, legal links, and localization options where applicable.
- Use muted text and clear link hierarchy.

## 8. Buttons and Actions

- Primary action: brand red background with white text.
- Primary hover: `--color-brand-red-hover`.
- Secondary action: white or neutral background with border.
- Link action: `--color-link-blue`.
- Destructive or discount action: use discount red only when semantically correct.
- Button radius: `4px` to `6px`.
- Button height:
  - Compact: `32px`
  - Default: `36px` to `40px`
  - Header search: `40px` to `44px`
- Do not create unique CTA styles per page.

## 9. Localization and Content Rules

- Design for Armenian localization first, while supporting Russian and English.
- Allow longer category names and product names without breaking cards.
- Avoid fixed-width text containers that truncate important localized labels too aggressively.
- Currency formatting must be consistent across product cards, detail pages, and comparison tables.
- Use localized CTA text consistently.
- Do not encode text inside images when the content needs localization.

## 10. Responsive Rules

- Mobile must feel like a real shopping app, not a squeezed desktop page.
- Header search remains prominent on mobile.
- Product grids use 2 columns on mobile.
- Filters move to drawer on mobile.
- Sorting remains easy to access through top controls or bottom bar.
- Product detail pages stack in purchase-priority order.
- CTAs should remain thumb-friendly while spacing stays compact.
- Avoid horizontal overflow.

## 11. Implementation Rules

- Always read this file before changing UI.
- Do not introduce new colors unless added as tokens here.
- Do not create one-off card styles.
- Do not change spacing randomly.
- Use shared components for cards, filters, sections, badges, buttons, and tables.
- Keep Tailwind classes clean and consistent.
- Prefer reusable variants over duplicated styles.
- Use semantic HTML for navigation, product lists, filters, tables, and reviews.
- Keep accessibility states for focus, hover, active, disabled, loading, and selected variants.
- Prefer component props and variants over copied class strings.
- If a new visual pattern is necessary, document it here before using it across the app.

## 12. Tailwind Usage Guidance

- Map color tokens into Tailwind theme values where practical.
- Prefer shared component classes or variant utilities for repeated patterns.
- Keep class order readable: layout, spacing, sizing, typography, color, border, state.
- Avoid long one-off class chains for repeated card, badge, button, table, and filter styles.
- Use responsive classes intentionally and consistently.
- Do not use arbitrary values unless they represent a documented token or unavoidable layout constraint.

## 13. Accessibility and Interaction

- All interactive controls must have visible focus states.
- Inputs, filters, drawers, menus, and carousels must be keyboard-accessible.
- Use sufficient contrast for text, borders, and CTAs.
- Do not communicate discounts, ratings, or availability by color alone.
- Buttons and links must have clear accessible names.
- Drawers and modals must handle focus trapping and escape behavior where applicable.

## 14. Review Checklist for UI Changes

Before merging UI work, verify:

- The page follows the `1180px` to `1240px` centered container system.
- Product grids follow 5 desktop, 3 tablet, and 2 mobile columns.
- Product cards use shared compact card styles.
- Filters use desktop sidebar and mobile drawer patterns.
- Search remains the primary header action.
- Colors come from documented tokens.
- Borders, radius, and shadows follow this document.
- Typography follows the marketplace scale.
- Mobile layout is not a squeezed desktop layout.
- Repeated UI patterns use shared components or variants.
- Armenian-localized content can fit without breaking the layout.
