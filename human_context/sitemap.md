
# Xentro App Sitemap

## Public

- `/` → Redirects to `/institutions`
- `/institutions` — Public catalog with search, type, sector filters (published only)
- `/institutions/[id]` — Institution detail with programs, events, SDG and sector labels

## Auth

- `/login` — Xentro admin login (mock credentials)
- `/manager-login` — Institute main manager login
- `/xplorer-login` — Xplorer account login
- `/xplorer-signup` — Xplorer signup (name, email, select up to 15 interested topics)
- `/mentor-signup` — Mentor/coach onboarding (submission for approval)
- `/mentor-login` — Mentor login (enabled after approval)
- Google login option for Xplorers accounts

## Xplorer Account

- `/account` — Xplorer dashboard/profile

## For Xplorers

- Xplorers can browse institutions, view details, and manage their own account via the Xplorer dashboard.

## Admin (Xentro)

- `/dashboard` — Overview stats and charts
- `/dashboard/institutions` — List/table toggle with search, type, status filters
- `/dashboard/add-institution` — 13-step onboarding wizard
- `/dashboard/managers` — Approve/manage main institute managers
- `/dashboard/approvals/mentors` — Approve mentor/coach applications (admin/approver)
- `/dashboard/approvals/institutions` — Approve institution submissions (admin/approver)
- `/dashboard/approvers` — Create/manage Xentro approval team members (auto-generated employee ID)

## Institute Management

- `/manager/dashboard` — Main manager dashboard (approved by Xentro admin)
- `/manager/institutions` — Manage owned/assigned institutions
- `/manager/institutions/[id]/page-managers` — Approve/manage page managers for an institution

## Institute Owner/Manager

- `/institution-owner/dashboard` — Institution owner dashboard
- `/institution-owner/startups` — Add/manage startups for the institution
- `/institution-owner/page-managers` — Approve/manage page managers

## Mentor

- `/mentor-signup` — Join as mentor/coach → fill details → submit for approval
- `/mentor/dashboard` — Post-approval mentor home
- `/mentor/packages` — Manage packages/pricing/achievements
- `/mentor/calendar` — Manage availability (dates/times)
- Email: mentors receive an approval email with a celebratory template and a login link once approved

## APIs (Mock)

- `POST /api/institutions` — Create institution
- `GET /api/institutions/[id]` — Fetch institution
- `PUT /api/institutions/[id]` — Update institution
- `DELETE /api/institutions/[id]` — Delete institution
- `POST /api/media` — Upload media
- `POST /api/startups` — Add startup (by institution owner/manager)
- `POST /api/managers` — Add/approve managers
- `POST /api/mentors` — Submit mentor application
- `GET/PUT /api/mentors/[id]` — View/update mentor record (status, profile)
- `POST /api/approvers` — Create approver (admin only)
- `POST /api/approvals/mentors` — Approve/reject mentor applications (admin/approver)
- `POST /api/approvals/institutions` — Approve/reject institutions (admin/approver)
