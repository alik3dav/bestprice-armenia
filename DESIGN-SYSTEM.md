# Design System

BestPrice Armenia uses a practical marketplace design language optimized for dense product scanning, trust, and Armenian-first localization.

## Brand and color
Use documented tokens only. Public marketplace UI prioritizes search, categories, product cards, price comparison, offers, and merchant trust. Use brand primary for commercial CTAs, link blue for navigational links, rating orange only for ratings, discount red only for discounts/destructive sale semantics, success green for availability/success, and neutral surfaces/borders for structure. Never communicate state by color alone.

The public header uses `--color-header-surface` for its cool neutral surface and `--color-action-blue` (with `--color-action-blue-hover`) for search, account, and comparison actions. Its wordmark remains `--color-brand-red`; action blue must not replace product price, discount, or availability semantics.

## Typography
Use system/Inter-compatible sans-serif typography unless a documented brand font is added. Hierarchy should be compact: page title, section title, product title, price, metadata, caption. Product names and labels must tolerate Armenian, Russian, and English text lengths. Avoid body text below 12px.

## Layout, grid, and spacing
Use centered public containers around 1180px-1240px. Product grids default to 5 columns desktop, 3 tablet, 2 mobile. Category/search pages use desktop sidebar filters and mobile drawer/bottom-filter patterns. Use spacing increments of 4, 8, 12, 16, 24, 32, and 48px. Avoid arbitrary spacing except documented constraints.

## Component styling
Cards use white surfaces, subtle borders, compact padding, and restrained shadows. Buttons, badges, inputs, rows, and tables must use shared variants. Product imagery should use stable aspect ratios and `object-fit: contain` where appropriate.

Homepage promotion banners use the existing large radius, clear image alt text, a restrained neutral dark overlay for text contrast when an image is supplied, and the documented brand CTA treatment. Empty image sources render a neutral gray placeholder surface. Keep the featured-category strip horizontally scrollable on small screens rather than allowing it to wrap or overflow the page.

Homepage discovery sections use a shared title row with an optional action-blue text link. The popular-category strip uses compact white tiles with a subtle border, shadow, circular neutral image well, and centered label; it is two columns on mobile, four on small screens, and eight on desktop. The daily-offers section uses the standard `ProductGridCard` in the documented responsive product grid.

The homepage community section sits directly above the public footer. It uses the neutral header surface, subtle border, large-radius container, optional right-aligned image, and compact Viber and Telegram subscription buttons; the Viber button uses `#7360f2` (hover `#6550e8`) and the Telegram button uses black (hover slate) for recognizable destination branding. Its popular-search links use compact white bordered chips that remain horizontally scrollable on small screens.

The public header is a two-row pattern: a primary row with the wordmark, rounded search field, utility actions, comparison action, and account action; then a horizontally scrollable category-navigation row. Header action icons must expose an accessible name and use the shared circular icon-button treatment. Keep the primary header search compact at desktop widths and allow it to fill its own row below the wordmark and account action on narrow screens.

The public footer uses the neutral header surface with a bordered top edge, compact Armenian-first link columns, and a merchant CTA card using the existing white-card and action-blue button treatments. Its copyright and marketplace metrics sit in a separate bordered bottom row; stack this row and the footer columns on small screens.

Category filter sidebars use the documented cool-neutral filter surface with compact white, subtly bordered filter cards. Each card has a sentence-case title and optional selected-count badge, price inputs with a non-interactive range indicator, native checkbox rows for merchants and availability, and two-column selectable specification options. Use action blue for selected controls and the apply action; retain visible labels and native controls so filters remain keyboard accessible.

## Motion and responsiveness
Motion must clarify state, stay under 200ms for common transitions, respect reduced motion, and avoid layout shift. Mobile must behave like a shopping app: prominent search, two-column grids, thumb-friendly CTAs, no horizontal overflow.
