# Copilot Instructions for Xentro App

- Stack: Next.js App Router (TS), Tailwind v4 tokens via CSS vars, all current pages are client components using `use client` and hooks.
- Entry: [app/page.tsx](app/page.tsx#L1-L3) redirects to `/institutions`; root layout sets Geist fonts and globals in [app/layout.tsx](app/layout.tsx#L1-L28).
- Routing: Public routes live under [app/(public)](app/(public)), admin under [app/(admin)](app/(admin)); keep admin pages wrapped by [app/(admin)/layout.tsx](app/(admin)/layout.tsx#L1-L13) to provide AuthContext and [app/(admin)/dashboard/layout.tsx](app/(admin)/dashboard/layout.tsx#L1-L174) for sidebar/topbar + auth guard.
- Auth: Mock-only; credentials `admin@xentro.io` / `admin123` validated in [contexts/AuthContext.tsx](contexts/AuthContext.tsx#L17-L70). `isAuthenticated` is in-memory; logout just clears state. No API calls yet.
- UI kit: Use barrel exports from [components/ui/index.ts](components/ui/index.ts#L1-L9) (Button, Card, Input, Badge/StatusBadge/VerifiedBadge, ProgressIndicator, SelectionCard, FileUpload, Select, Textarea). Prefer these over raw HTML to match styling/spacing.
- Styling: Uses CSS custom properties (e.g., `var(--primary)`, `--surface`) inside Tailwind class strings; keep consistent naming and rounded radius tokens (`var(--radius-md)` etc.). Animations use custom classes like `animate-fadeInUp`/`stagger-*` defined in globals.
- Data source: All content is mock data in [lib/data.ts](lib/data.ts). Types and label maps live in [lib/types.ts](lib/types.ts). Utilities for formatting and class names in [lib/utils.ts](lib/utils.ts). When adding mock institutions, keep label maps and aggregates (e.g., `dashboardStats`, `generateStaticParams` consumers) in sync.
- Public listing: [app/(public)/institutions/page.tsx](app/(public)/institutions/page.tsx#L1-L139) filters `mockInstitutions` by search/type/sector and only shows `status === 'published'`; cards link to detail pages.
- Public detail: [app/(public)/institutions/[id]/page.tsx](app/(public)/institutions/[id]/page.tsx#L1-L189) prebuilds pages via `generateStaticParams` using `mockInstitutions`; update data before relying on new routes. Includes programs/events filtered by `institutionId` and focuses on label maps for SDGs/sectors.
- Admin dashboard: [app/(admin)/dashboard/page.tsx](app/(admin)/dashboard/page.tsx#L1-L106) shows stat cards and simple bar/progress visuals fed by `dashboardStats`, `institutionsByMonth`, `institutionTypeDistribution` from `lib/data` and formatters.
- Admin institutions list: [app/(admin)/dashboard/institutions/page.tsx](app/(admin)/dashboard/institutions/page.tsx#L1-L200) supports search, type/status filters, and view toggle (cards/table). Reuse `institutionTypeLabels`, `StatusBadge`, and `formatNumber` when extending.
- Onboarding flow: [app/(admin)/dashboard/add-institution/page.tsx](app/(admin)/dashboard/add-institution/page.tsx#L1-L197) drives a 13-step wizard using slides in [components/onboarding](components/onboarding). Form state held locally (`formData`), step gating via `canProceed`, publish/save currently just `alert` + route push; replace with real persistence as needed.
- Review slide: [components/onboarding/ReviewPublishSlide.tsx](components/onboarding/ReviewPublishSlide.tsx#L1-L152) shows summary and edit shortcuts; keep step numbers aligned if reordering slides.
- Public layout: [app/(public)/layout.tsx](app/(public)/layout.tsx#L1-L13) wraps pages with navbar/footer from [components/public/Layout.tsx](components/public/Layout.tsx). Maintain shared shell when adding public pages.
- Admin login: [app/(admin)/login/page.tsx](app/(admin)/login/page.tsx#L1-L119) uses `useAuth().login`; errors and loading handled locally. Redirect target is `/dashboard` on success.
- Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint` (ESLint + next config). No custom test suite configured.
- Conventions: Use `cn` from `lib/utils` for class merging, `formatNumber`/`formatCurrency` for display metrics, and label maps (`institutionTypeLabels`, `sdgLabels`, `sectorLabels`, `operatingModeLabels`) instead of hardcoded strings/emojis.
- Assets: Mock logos reference `/public/logos/*.svg`; keep filenames consistent when adding data.
- SSG considerations: Any dynamic `[id]` pages rely on `mockInstitutions`; add entries there to make routes available and keep `status` to control public visibility.
- When introducing real APIs/auth, replace mock logic in AuthContext and update guards in dashboard layout accordingly.

Let me know if any section needs more detail or if other workflows should be captured.
