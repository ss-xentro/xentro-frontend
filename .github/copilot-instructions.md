# Copilot Instructions for Xentro App

## Stack & Core Architecture
- **Framework**: Next.js 16 App Router (TypeScript); Tailwind 4 with CSS vars (`--primary`, `--radius-md`); Drizzle ORM on Neon serverless Postgres
- **Route groups**: Public routes under `app/(public)`, admin under `app/(admin)` with AuthProvider, institution dashboards under `app/(institution)` 
- **Fonts/globals**: Set in [../app/layout.tsx](../app/layout.tsx); home hero/options in [../app/page.tsx](../app/page.tsx)
- **Commands**: `npm run dev|build|start|lint`, `npm run db:generate|db:push` (Drizzle); package manager is npm (Bun used for dev scripts)

## Data Flow Pattern (critical)
**API → Controller → Repository → DB**
1. API routes ([../app/api/\*/route.ts](../app/api)) call controllers in [../server/controllers](../server/controllers)
2. Controllers wrap Drizzle repositories and normalize media URLs via [../server/services/storage.ts](../server/services/storage.ts)
3. Throw `HttpError(status, message)` from [../server/controllers/http-error.ts](../server/controllers/http-error.ts) for status-aware failures
4. All database schemas in [../db/schemas/index.ts](../db/schemas/index.ts); client in [../db/client.ts](../db/client.ts) (Neon HTTP transport)

**Example**: `GET /api/institutions` → `institutionController.listPublished()` → `institutionRepository.listPublished()` → Drizzle query → normalize logo URLs → return JSON

## Authentication Layers (dual system)
1. **Admin (UI-only mock)**: [../contexts/AuthContext.tsx](../contexts/AuthContext.tsx) - hardcoded `admin@xentro.io`/`admin123`, 6h localStorage session; `useAuth` hook redirects to [../app/(admin)/login/page.tsx](../app/(admin)/login/page.tsx) if missing
2. **API auth (JWT)**: [../server/services/auth.ts](../server/services/auth.ts) - `signJwt/verifyJwt` with `JWT_SECRET` env var (falls back to dev-only insecure key); `requireAuth(headers, roles?)` guards protected routes; dev helper [../app/api/dev/mock-admin/route.ts](../app/api/dev/mock-admin/route.ts) returns admin JWT outside production

## Institution Onboarding (two-phase flow)
**Phase 1** ([../app/(public)/institution-onboarding/page.tsx](../app/(public)/institution-onboarding/page.tsx)): 3-step wizard (Name → Email → Verify) sends magic link via `POST /api/institution-applications`, redirects to Phase 2 after token verification  
**Phase 2** ([../app/(public)/institution-dashboard/page.tsx](../app/(public)/institution-dashboard/page.tsx)): 13-step form with live preview sidebar; validates required fields (type, name, tagline, city, country, description); `POST /api/institution-applications/{id}` marks status=`pending`  
**Approval**: Only applications with `status='pending' AND verified=true` appear in [../app/(admin)/dashboard/institution-approvals/page.tsx](../app/(admin)/dashboard/institution-approvals/page.tsx); approved applications create published institutions and are archived

## UI Kit & Styling Conventions
- **Components**: Import from [../components/ui/index.ts](../components/ui/index.ts) (Badge, Button, Card, FileUpload, Input, ProgressIndicator, Select, Textarea)
- **Utilities**: Use `cn()` from [../lib/utils.ts](../lib/utils.ts) for className merging; animations via `animate-fadeInUp`, `stagger-*` classes
- **Touch targets**: All buttons **min-h-[44px]** (Apple HIG); consistent 200-300ms transitions
- **Label maps**: Institution types, SDGs, sectors, countries, currencies in [../lib/types.ts](../lib/types.ts); formatters (`formatNumber`, `formatCurrency`, `slugify`) in [../lib/utils.ts](../lib/utils.ts)

## Storage & External Services
- **Media uploads**: [../server/services/storage.ts](../server/services/storage.ts) - Cloudflare R2 via S3 SDK (env: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, optional `R2_PUBLIC_URL`); `uploadToR2()` generates random UUIDs, returns public URL
- **Email**: [../server/services/email.ts](../server/services/email.ts) - SMTP vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`); logs to console when unset (dev mode)
- **Logos**: Store in `/public/logos`; resolve via `resolveMediaUrl()` from storage service

## Database Operations (Drizzle patterns)
- **Query example**: `await db.select().from(institutions).where(eq(institutions.status, 'published'))`
- **Schema location**: [../db/schemas/index.ts](../db/schemas/index.ts) - institutions, programs, events, users, auth tables, startups, team_members
- **Migrations**: `npm run db:generate` creates SQL in `/drizzle`; `npm run db:push` applies to Neon (see [../drizzle.config.ts](../drizzle.config.ts))
- **Repositories**: Wrap common queries in [../server/repositories](../server/repositories); always use prepared statements/parameterized queries

## Accessibility (non-negotiable)
- **Forms**: All inputs have `aria-label`, `aria-required`, `aria-describedby`; errors use `role="alert"` with `aria-live="polite"`
- **Keyboard**: Tab navigation + `Cmd/Ctrl+Enter` submit shortcuts; visible focus states (Tailwind `focus:` utilities)
- **Semantic HTML**: `role` attributes on main sections; screen reader labels on icon-only buttons

## Quality Standards (per [../human_context/quality.md](../human_context/quality.md))
- **Error messages**: Human-readable with recovery paths (e.g., "Email not found. Try signing up first.")
- **Empty states**: Show guidance text + CTA (not just "No results")
- **Loading states**: Use skeleton loaders (not spinners alone) for content-heavy views
- **Copy tone**: Explain "why" not just "what" (e.g., "We verify emails to prevent spam" vs "Verify email")
- **Icons**: Support meaning, not decoration; always pair with text or aria-label

## Key Files Reference
| Purpose | File(s) |
|---------|---------|
| Data types & label maps | [../lib/types.ts](../lib/types.ts) |
| UI utilities & formatters | [../lib/utils.ts](../lib/utils.ts) |
| Admin auth context | [../contexts/AuthContext.tsx](../contexts/AuthContext.tsx) |
| API auth helpers | [../server/services/auth.ts](../server/services/auth.ts) |
| Cloudflare R2 uploads | [../server/services/storage.ts](../server/services/storage.ts) |
| HTTP error handling | [../server/controllers/http-error.ts](../server/controllers/http-error.ts) |
| Database client | [../db/client.ts](../db/client.ts) |
| All schemas | [../db/schemas/index.ts](../db/schemas/index.ts) |
| Institution onboarding | [../app/(public)/institution-onboarding/page.tsx](../app/(public)/institution-onboarding/page.tsx), [../app/(public)/institution-dashboard/page.tsx](../app/(public)/institution-dashboard/page.tsx) |
| Admin approvals | [../app/(admin)/dashboard/institution-approvals/page.tsx](../app/(admin)/dashboard/institution-approvals/page.tsx) |

## Dev Workflows
- **Local dev**: `npm run dev` (Next.js on port 3000); mock admin login available at `/login` with `admin@xentro.io` / `admin123`
- **DB changes**: 1) Update [../db/schemas/index.ts](../db/schemas/index.ts), 2) `npm run db:generate`, 3) `npm run db:push` (applies to Neon)
- **API testing**: Use [../app/api/dev/mock-admin/route.ts](../app/api/dev/mock-admin/route.ts) to get JWT for protected routes (dev only, returns 403 in production)
- **Data cleanup**: See terminal history for Bun script pattern to delete test data by email across tables
- **No tests**: Test suite not configured yet; manual testing via browser + API client

## Current Gaps (ref: [../human_context/backend-flow.md](../human_context/backend-flow.md))
- Xplorer auth (Google OAuth), mentor approval flow, startup CRUD, page manager approvals - partially implemented
- Most API routes lack auth guards (only `/api/approvals/*` and `/api/approvers` use `requireAuth`)
- Institution owner/manager roles exist in schemas but not enforced in controllers yet
