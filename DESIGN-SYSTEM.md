# Design System

BestPrice Armenia uses a practical marketplace design language optimized for dense product scanning, trust, and Armenian-first localization.

## Brand and color
Use documented tokens only. Public marketplace UI prioritizes search, categories, product cards, price comparison, offers, and merchant trust. Use brand primary for commercial CTAs, link blue for navigational links, rating orange only for ratings, discount red only for discounts/destructive sale semantics, success green for availability/success, and neutral surfaces/borders for structure. Never communicate state by color alone.

## Typography
Use system/Inter-compatible sans-serif typography unless a documented brand font is added. Hierarchy should be compact: page title, section title, product title, price, metadata, caption. Product names and labels must tolerate Armenian, Russian, and English text lengths. Avoid body text below 12px.

## Layout, grid, and spacing
Use centered public containers around 1180px-1240px. Product grids default to 5 columns desktop, 3 tablet, 2 mobile. Category/search pages use desktop sidebar filters and mobile drawer/bottom-filter patterns. Use spacing increments of 4, 8, 12, 16, 24, 32, and 48px. Avoid arbitrary spacing except documented constraints.

## Component styling
Cards use white surfaces, subtle borders, compact padding, and restrained shadows. Buttons, badges, inputs, rows, and tables must use shared variants. Product imagery should use stable aspect ratios and `object-fit: contain` where appropriate.

## Motion and responsiveness
Motion must clarify state, stay under 200ms for common transitions, respect reduced motion, and avoid layout shift. Mobile must behave like a shopping app: prominent search, two-column grids, thumb-friendly CTAs, no horizontal overflow.
