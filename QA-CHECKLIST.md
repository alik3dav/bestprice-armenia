# QA Checklist

No task is complete until applicable items pass or documented limitations are reported.

## Design and UX
- Uses documented colors, spacing, typography, cards, buttons, badges, and layout patterns.
- Preserves search-first marketplace behavior and comparison clarity.
- Handles loading, empty, error, disabled, and success states.
- Works responsively on mobile, tablet, and desktop without horizontal overflow.

## Performance and SEO
- Avoids unnecessary client components, dependencies, scripts, and large payloads.
- Images, fonts, caching, pagination, and data selection are optimized.
- Metadata, headings, internal links, canonical/indexability, and structured data are correct where relevant.

## Accessibility and security
- Semantic HTML, labels, keyboard navigation, focus management, contrast, and screen reader support are verified.
- Server-side auth/authorization, validation, sanitization, RLS, secrets, and safe dependency use are preserved.

## Build and regression
- Relevant automated checks ran: at minimum `npm run typecheck` for code changes and `npm run build` for route/config/data/production changes.
- Existing patterns were reused or intentionally refactored.
- Documentation and changelog were updated for notable changes.
