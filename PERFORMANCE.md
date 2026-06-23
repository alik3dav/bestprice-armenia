# Performance Standards

Every update must preserve or improve performance. Targets: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 on representative mobile conditions.

Prefer server components and code splitting. Avoid unnecessary `use client`, heavy dependencies, and large client-side data sets. Optimize images with explicit dimensions, responsive sizes, stable aspect ratios, lazy loading below the fold, and product `object-fit: contain` where appropriate. Fonts should be limited, preloaded only when needed, and configured to avoid layout shift.

Use cache-aware server data loading for public routes, select only needed columns, paginate large lists, and avoid N+1 queries. Third-party scripts require documented purpose, async/defer strategy, and performance review. Product, category, search, and detail pages must not regress Core Web Vitals without explicit approval and mitigation.
