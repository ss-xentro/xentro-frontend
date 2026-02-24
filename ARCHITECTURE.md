# XENTRO Platform Architecture

**Last Updated:** January 2025
**Version:** 2.0 (Unified Context-Based Architecture)

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [System Overview](#system-overview)
3. [User Identity & Contexts](#user-identity--contexts)
4. [Forms Engine](#forms-engine)
5. [Feed System](#feed-system)
6. [Authentication Flow](#authentication-flow)
7. [API Structure](#api-structure)
8. [Database Schema](#database-schema)
9. [Security Architecture](#security-architecture)

---

## Core Philosophy

### Key Principles

1. **One Email = One User**
   - Single global identity per email address
   - No separate accounts for different roles
   - All users start as Explorer

2. **Context-Based Dashboards**
   - Roles (Founder, Mentor, Institute Admin) are unlocked via actions
   - Switching contexts = switching dashboard views
   - Not account-based, context-based

3. **Forms Engine for All Actions**
   - All create/apply actions go through forms
   - Form states: `draft → submitted → review → approved/rejected`
   - Approval hooks + audit logs mandatory

4. **Feed-First Discovery**
   - Feed built from form submissions
   - Interactions: appreciation (❤️), viewed (👁️), mentor tip (💡)
   - No comments/chat in Phase-1

---

## System Overview

### Technology Stack

```table
┌─────────────────────────────────────────────────────────┐
│ Frontend: Next.js 16 (App Router) + React + TypeScript │
├─────────────────────────────────────────────────────────┤
│ Backend: Next.js API Routes (Route Handlers)           │
├─────────────────────────────────────────────────────────┤
│ ORM: Drizzle ORM (Type-safe SQL)                       │
├─────────────────────────────────────────────────────────┤
│ Database: PostgreSQL (Neon Serverless)                 │
├─────────────────────────────────────────────────────────┤
│ Storage: Cloudflare R2 (S3-compatible)                 │
├─────────────────────────────────────────────────────────┤
│ Email: SMTP (Nodemailer) with HTML templates          │
├─────────────────────────────────────────────────────────┤
│ Auth: JWT (jose) - Base + Context tokens               │
├─────────────────────────────────────────────────────────┤
│ State Management: Zustand (client-side stores)         │
└─────────────────────────────────────────────────────────┘
```

### Architecture Layers

```flow
┌──────────────────────────────────────────────────────────┐
│                    CLIENT REQUEST                        │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  Layer 1: API Routes (app/api/**/route.ts)              │
│  - Request parsing & validation                          │
│  - Response formatting                                    │
│  - Error handling wrapper                                 │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  Layer 2: RBAC Middleware (server/middleware/rbac.ts)   │
│  - requireAuth() - Base authentication                   │
│  - requireContext() - Context validation                 │
│  - requireStartupRole() - Startup-specific access        │
│  - requireInstituteRole() - Institution access           │
│  - requireAdminLevel() - Admin level checks              │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  Layer 3: Services (server/services/)                    │
│  - unified-auth.ts - Authentication & JWT                │
│  - forms.ts - Forms Engine                               │
│  - feed.ts - Feed System                                 │
│  - activity.ts - Activity Logging                        │
│  - notifications.ts - User Notifications                 │
│  - storage.ts - R2 Media Uploads                         │
│  - email.ts - SMTP Email Service                         │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│               DATABASE (Unified Schema)                  │
│  db/schemas/unified.ts                                   │
└──────────────────────────────────────────────────────────┘
```

---

## User Identity & Contexts

### Context System

```flow
                     ┌────────────────┐
                     │  GLOBAL USER   │
                     │  (email=PK)    │
                     └───────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌──────────┐     ┌──────────────┐   ┌──────────────┐
    │ EXPLORER │     │   STARTUP    │   │   MENTOR     │
    │ (default)│     │  (unlocked)  │   │  (unlocked)  │
    └──────────┘     └──────────────┘   └──────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
             ┌──────────┐     ┌──────────────┐
             │ INSTITUTE│     │    ADMIN     │
             │(unlocked)│     │  (unlocked)  │
             └──────────┘     └──────────────┘
```

### Context Unlocking Rules

| Context   | Unlocked By                        |
| --------- | ---------------------------------- |
| Explorer  | Default (all users start here)     |
| Startup   | `startup_create` form approved     |
| Mentor    | `mentor_apply` form approved       |
| Institute | `institute_create` form approved   |
| Admin     | Assigned by existing L3 admin      |

### JWT Structure

**Base JWT** (identity only):

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "emailVerified": true,
  "unlockedContexts": ["explorer", "startup", "mentor"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Context JWT** (scoped to role/entity):

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "emailVerified": true,
  "unlockedContexts": ["explorer", "startup", "mentor"],
  "context": "startup",
  "contextEntityId": "startup-uuid",
  "contextRole": "founder",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## Forms Engine

### Form Lifecycle

```flow
┌─────────┐    ┌───────────┐    ┌──────────────┐    ┌──────────┐
│  DRAFT  │───▶│ SUBMITTED │───▶│ UNDER_REVIEW │───▶│ APPROVED │
└─────────┘    └───────────┘    └──────────────┘    └──────────┘
     │              │                  │                   │
     │              │                  │                   ▼
     │              │                  │           ┌──────────────┐
     │              │                  └──────────▶│   REJECTED   │
     │              │                              └──────────────┘
     │              │
     │              ▼
     │       ┌───────────┐
     └──────▶│ WITHDRAWN │
             └───────────┘
```

### Form Types

| Form Type        | Creates          | Unlocks Context |
|------------------|------------------|-----------------|
| startup_create   | Startup entity   | startup         |
| mentor_apply     | Mentor profile   | mentor          |
| institute_create | Institution      | institute       |
| event_create     | Event            | -               |
| program_create   | Program          | -               |

### Approval Processing

When a form is approved:

1. Entity is created (startup/mentor/institution)
2. User's context is unlocked
3. Feed item is generated
4. Activity log is recorded
5. Submitter is notified

---

## Feed System

### Feed Item Sources

```flow
┌──────────────────────────────────────────┐
│            FORM APPROVAL                 │
│  (startup_create, mentor_apply, etc.)    │
└────────────────────┬─────────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │   FEED ITEM     │
            │  - sourceType   │
            │  - sourceId     │
            │  - title        │
            │  - sectors      │
            │  - stages       │
            └────────┬────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
   ┌───────────┐ ┌────────┐ ┌──────────┐
   │ APPRECIATE│ │ VIEWED │ │MENTOR_TIP│
   │    ❤️     │ │   👁️   │ │    💡    │
   └───────────┘ └────────┘ └──────────┘
```

### Ranking Formula

```formulae
score = (appreciations × 3) + (mentor_tips × 5) + (views × 0.1) + recency_bonus
```

Where `recency_bonus = max(0, 10 - (age_in_hours / 24) × 2)`

---

## Authentication Flow

### Multi-Provider Auth

```flow
┌──────────────────────────────────────────────────────────┐
│                   AUTH PROVIDERS                         │
├────────────────┬────────────────┬────────────────────────┤
│    GOOGLE      │  CREDENTIALS   │         OTP            │
│  (OAuth 2.0)   │(Email+Password)│   (Passwordless)       │
└───────┬────────┴───────┬────────┴───────────┬────────────┘
        │                │                    │
        └────────────────┼────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │   USER RECORD    │
              │ (single identity)│
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │   BASE JWT       │
              │ (24h validity)   │
              └────────┬─────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
   ┌───────────┐ ┌───────────┐ ┌───────────┐
   │ EXPLORER  │ │  STARTUP  │ │  MENTOR   │
   │  Context  │ │  Context  │ │  Context  │
   └───────────┘ └───────────┘ └───────────┘
```

### Context Switching

1. User authenticates → receives Base JWT
2. User switches context → receives Context JWT
3. Context JWT is scoped to specific entity (startup/institution)
4. API routes validate context permissions

---

## REST API Structure

### Auth Endpoints

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | /api/auth/signup          | Create account           |
| POST   | /api/auth/login           | Login with credentials   |
| POST   | /api/auth/google          | Google OAuth login       |
| POST   | /api/auth/otp/request     | Request OTP              |
| POST   | /api/auth/otp/verify      | Verify OTP & login       |
| GET    | /api/auth/me              | Get current user         |
| POST   | /api/auth/me              | Update profile           |
| POST   | /api/auth/context/switch  | Switch context           |
| POST   | /api/auth/logout          | Logout                   |

### Forms Endpoints

| Method | Endpoint                         | Description           |
|--------|----------------------------------|-----------------------|
| GET    | /api/forms                       | Get user's forms      |
| POST   | /api/forms                       | Create form (draft)   |
| POST   | /api/forms/[id]/submit           | Submit form           |
| GET    | /api/admin/forms                 | Get forms for review  |
| POST   | /api/admin/forms/[id]/review     | Review form           |

### Feed Endpoints

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/feed                   | Get feed (personalized)  |
| GET    | /api/feed/[id]              | Get feed item            |
| POST   | /api/feed/[id]/appreciate   | Appreciate item          |
| DELETE | /api/feed/[id]/appreciate   | Remove appreciation      |
| POST   | /api/feed/[id]/mentor-tip   | Send mentor tip          |

### Notifications Endpoints

| Method | Endpoint                       | Description              |
|--------|--------------------------------|--------------------------|
| GET    | /api/notifications             | Get notifications        |
| POST   | /api/notifications/read-all    | Mark all read            |
| POST   | /api/notifications/[id]        | Mark one read            |
| DELETE | /api/notifications/[id]        | Delete notification      |

---

## Database Schema

### Core Tables

```file-tree
users
├── id (PK)
├── email (unique)
├── name
├── avatar
├── unlockedContexts (json array)
├── activeContext (enum)
├── twoFactorEnabled
├── emailVerified
└── timestamps

auth_accounts
├── id (PK)
├── userId (FK → users)
├── provider (google|credentials|otp)
├── providerAccountId
├── passwordHash (for credentials)
└── timestamps

forms
├── id (PK)
├── type (form_type enum)
├── status (form_status enum)
├── submittedBy (FK → users)
├── data (json)
├── attachments (json)
├── reviewedBy (FK → users)
├── reviewNotes
├── resultEntityType
├── resultEntityId
├── version
└── timestamps

feed_items
├── id (PK)
├── sourceType
├── sourceId
├── title
├── summary
├── sectors (json array)
├── stages (json array)
├── createdBy (FK → users)
├── viewCount
├── appreciationCount
├── mentorTipCount
├── rankScore
└── timestamps
```

### Context-Specific Tables

```file-tree
startups
├── id (PK)
├── slug (unique)
├── name, tagline, description
├── stage, status
├── sectors, sdgFocus (json arrays)
├── formId (FK → forms)
└── timestamps

startup_members
├── id (PK)
├── startupId (FK → startups)
├── userId (FK → users)
├── role (startup_role enum)
├── title
└── timestamps

institutions
├── id (PK)
├── slug (unique)
├── name, type, tagline
├── sectorFocus, sdgFocus (json arrays)
├── formId (FK → forms)
└── timestamps

mentor_profiles
├── id (PK)
├── userId (FK → users)
├── status (pending|approved|rejected)
├── headline, bio
├── expertise, industries (json arrays)
├── hourlyRate, currency
└── timestamps

admin_profiles
├── id (PK)
├── userId (FK → users)
├── level (L1|L2|L3)
├── permissions (json array)
├── assignedBy (FK → users)
└── timestamps
```

---

## Security Architecture

### Admin Levels & Permissions

| Level | Permissions                                    |
|-------|------------------------------------------------|
| L1    | review_forms, view_reports                     |
| L2    | L1 + approve_forms, reject_forms, moderate     |
| L3    | L2 + manage_admins, manage_users, settings     |

### 2FA Requirements

- Required for all admin contexts (L1, L2, L3)
- Optional for other contexts
- Enforced at context switch time

### RBAC Middleware Functions

```typescript
// Base authentication
requireAuth(headers)

// Context validation
requireContext(headers, ['startup', 'mentor'])

// Startup-specific
requireStartupRole(headers, startupId, ['founder', 'co_founder'])

// Institution-specific
requireInstituteRole(headers, institutionId, ['owner', 'admin'])

// Admin checks
requireAdminLevel(headers, 'L2')
requireAdminPermission(headers, 'approve_forms')

// Mentor only
requireMentor(headers)
```

---

## Key Files Reference

| Purpose                | File                                |
|------------------------|-------------------------------------|
| Unified Schema         | db/schemas/unified.ts               |
| TypeScript Types       | lib/unified-types.ts                |
| Auth Service           | server/services/unified-auth.ts     |
| RBAC Middleware        | server/middleware/rbac.ts           |
| Forms Engine           | server/services/forms.ts            |
| Feed Service           | server/services/feed.ts             |
| Activity Logging       | server/services/activity.ts         |
| Notifications          | server/services/notifications.ts    |
| Auth API Routes        | app/api/auth/**                     |
| Forms API Routes       | app/api/forms/**                    |
| Feed API Routes        | app/api/feed/**                     |
| Admin API Routes       | app/api/admin/**                    |

### Directory Structure

```file-tree
server/
├── controllers/
│   ├── http-error.ts                    # Custom error class with status codes
│   ├── institution.controller.ts        # Institution CRUD logic
│   ├── institutionApplication.controller.ts  # Application workflow
│   ├── mentor.controller.ts             # Mentor application & approval
│   ├── approver.controller.ts           # Approver management
│   ├── startup.controller.ts            # Startup CRUD operations
│   └── xplorer.controller.ts            # Xplorer authentication
│
├── middleware/
│   └── institutionAuth.ts               # Authentication & authorization
│       ├── verifyInstitutionAuth()      # JWT + ownership validation
│       ├── requireRole()                # RBAC enforcement
│       └── verifyInstitutionAccess()    # Resource ownership check
│
├── repositories/
│   ├── institution.repository.ts        # Institution DB queries
│   ├── institutionMember.repository.ts  # Team member queries
│   ├── institutionApplication.repository.ts
│   ├── program.repository.ts
│   ├── project.repository.ts            # Institution projects
│   ├── startup.repository.ts            # Startup CRUD with founders
│   ├── user.repository.ts               # User management
│   ├── mentor.repository.ts             # Mentor profiles & applications
│   ├── event.repository.ts              # Events management
│   ├── media.repository.ts              # Media assets
│   └── approver.repository.ts           # Approver team
│
├── services/
│   ├── auth.ts                          # JWT signing/verification
│   ├── sessionCache.ts                  # In-memory session cache
│   ├── storage.ts                       # Cloudflare R2 operations
│   ├── email.ts                         # SMTP email sending
│   └── password.ts                      # bcrypt hashing
│
└── utils/
    └── password.ts                      # Password utilities
```

---

## Database Architecture

### Entity Relationship Diagram

```erd
┌─────────────────────────────────────────────────────────────────────┐
│                         CORE ENTITIES                                │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │    users     │
                    ├──────────────┤
                    │ id (PK)      │
                    │ name         │
                    │ email        │◄───────┐
                    │ phone        │        │
                    │ account_type │        │
                    │ created_at   │        │
                    └──────┬───────┘        │
                           │                │
                           │                │
        ┌──────────────────┼────────────────┼──────────────┐
        │                  │                │              │
        ▼                  ▼                ▼              ▼
┌───────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│explorer_      │  │mentor_       │  │investor_     │  │team_members  │
│profiles       │  │profiles      │  │profiles      │  │              │
├───────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤
│id (PK)        │  │id (PK)       │  │id (PK)       │  │id (PK)       │
│user_id (FK)   │  │user_id (FK)  │  │user_id (FK)  │  │user_id (FK)  │
│interests      │  │expertise     │  │type          │  │startup_id(FK)│
│upgraded       │  │rate          │  │verified      │  │role          │
└───────────────┘  │status        │  └──────────────┘  └──────────────┘
                   │verified      │
                   │occupation    │
                   │packages      │
                   │achievements  │
                   └──────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    INSTITUTION ECOSYSTEM                             │
└─────────────────────────────────────────────────────────────────────┘

        ┌────────────────────────────┐
        │ institution_applications   │
        ├────────────────────────────┤
        │ id (PK)                    │
        │ name                       │
        │ email (UNIQUE)             │
        │ type                       │
      │ status                     │──── 'pending' → 'approved'
        │ verified                   │
        │ verification_token         │
        │ institution_id (FK)        │──┐
        │ applicant_user_id (FK)     │  │
        │ sdg_focus (JSON)           │  │
        │ sector_focus (JSON)        │  │
        │ legal_documents (JSON)     │  │
        └────────────────────────────┘  │
                                        │
                                        ▼
                    ┌─────────────────────────────┐
                    │      institutions           │
                    ├─────────────────────────────┤
                    │ id (PK)                     │
                    │ slug (UNIQUE, INDEXED) ◄────┼── URL-friendly identifier
                    │ name                        │
                    │ type                        │
                    │ email (UNIQUE)              │
                    │ status (INDEXED)            │
                    │ profile_views               │──── Analytics counter
                    │ verified                    │
                    │ sdg_focus (JSON)            │
                    │ sector_focus (JSON)         │
                    │ logo, website, linkedin     │
                    │ city, country, country_code │
                    │ description                 │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────┼─────────────────────┐
                    │             │                     │
                    ▼             ▼                     ▼
        ┌─────────────────┐  ┌─────────────┐  ┌──────────────┐
        │institution_     │  │  programs   │  │  projects    │
        │members          │  ├─────────────┤  ├──────────────┤
        ├─────────────────┤  │id (PK)      │  │id (PK)       │
        │id (PK)          │  │institution_ │  │institution_  │
        │institution_id   │◄─┤id (FK)      │  │id (FK)       │
        │user_id (FK)     │  │name         │  │name          │
        │role             │  │type         │  │status        │
        │  - owner        │  │description  │  │description   │
        │  - admin        │  │duration     │  │start_date    │
        │  - manager      │  │is_active    │  │end_date      │
        │  - viewer       │  │start_date   │  └──────────────┘
        │invited_by       │  │end_date     │  ┌──────────────────┐
        │institution_     │  │  programs   │  │    startups      │
        │members          │  ├─────────────┤  ├──────────────────┤
        ├─────────────────┤  │id (PK)      │  │id (PK)           │
        │id (PK)          │  │institution_ │  │name              │
        │institution_id   │◄─┤id (FK)      │  │institution_id(FK)│
        │user_id (FK)     │  │name         │  │owner_id (FK)     │
        │role             │  │type         │  │stage             │
        │  - owner        │  │description  │  │location          │
        │  - admin        │  │duration     │  │one_liner         │
        │  - manager      │  │is_active    │  └──────────────────┘
        │  - viewer       │  │start_date   │
        │invited_by       │  │end_date     │
        │is_active        │  └─────────────┘
        └─────────────────┘
                                            ┌──────────────┐
                                            │   events     │
                                            ├──────────────┤
                                            │id (PK)       │
                                            │institution_  │
                                            │id (FK)       │
                                            │name          │
                                            │type          │
                                            │start_time    │
                                            │location      │
                                            │approved      │
                                            └──────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION SYSTEM                           │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐        ┌─────────────────────────┐
│auth_accounts     │        │institution_sessions     │
├──────────────────┤        ├─────────────────────────┤
│id (PK)           │        │id (PK)                  │
│user_id (FK)      │        │email                    │
│provider          │        │otp                      │
│  - credentials   │        │institution_id (FK)      │
│  - google        │        │expires_at               │
│  - otp           │        │verified                 │
│provider_account_ │        │created_at               │
│id                │        └─────────────────────────┘
│password_hash     │
└──────────────────┘        ┌─────────────────────────┐
                            │startup_sessions         │
                            ├─────────────────────────┤
                            │id (PK)                  │
                            │email                    │
                            │otp                      │
                            │startup_id (FK)          │
                            │expires_at               │
                            │verified                 │
                            │created_at               │
                            └─────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         MEDIA & STORAGE                              │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│media_assets      │
├──────────────────┤
│id (PK)           │
│bucket            │──── R2 bucket name
│key               │──── Object key in bucket
│url               │──── Public URL
│mime_type         │
│size              │
│entity_type       │──── 'mentor', 'startup', 'institution', etc.
│entity_id         │──── Foreign key to entity
│created_at        │
└──────────────────┘
```

### Database Schema Details

#### 1. **users** (Core User Table)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(320) NOT NULL UNIQUE,
    phone VARCHAR(50),
   account_type account_type_enum NOT NULL,
   -- 'explorer', 'mentor', 'institution', etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX users_email_idx ON users(email);
```

#### 2. **institutions** (Main Institution Entity)

```sql
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,  -- URL-friendly: 'stanford-accelerator'
    name VARCHAR(255) NOT NULL,
   type VARCHAR(120) NOT NULL,
   -- 'incubator', 'accelerator', 'university', 'vc', 'csr'
    email VARCHAR(320) UNIQUE NOT NULL,
    status VARCHAR(32) DEFAULT 'draft',
    profile_views INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,

    -- Location
    city VARCHAR(180),
    country VARCHAR(180),
    country_code VARCHAR(4),
    operating_mode VARCHAR(50),         -- 'local', 'national', 'global', 'remote-first'

    -- Identity
    tagline VARCHAR(280),
    description TEXT,
    logo VARCHAR(255),
    website VARCHAR(255),
    linkedin VARCHAR(255),
    phone VARCHAR(50),

    -- Impact metrics
    startups_supported INTEGER DEFAULT 0,
    students_mentored INTEGER DEFAULT 0,
    funding_facilitated NUMERIC(16,2) DEFAULT 0,
    funding_currency VARCHAR(8),

    -- Focus areas (JSON arrays)
    sdg_focus JSONB,                    -- ['sdg-1', 'sdg-4', 'sdg-13']
    sector_focus JSONB,                 -- ['ai', 'healthtech', 'climatetech']
    legal_documents JSONB,              -- ['https://r2.../doc1.pdf', ...]

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX institutions_slug_idx ON institutions(slug);
CREATE INDEX institutions_status_idx ON institutions(status);
CREATE INDEX institutions_email_idx ON institutions(email);
```

#### 3. **institution_members** (RBAC Team Management)

```sql
CREATE TYPE institution_role AS ENUM ('owner', 'admin', 'manager', 'viewer');

CREATE TABLE institution_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role institution_role NOT NULL DEFAULT 'viewer',
    invited_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(institution_id, user_id)
);

CREATE INDEX institution_members_institution_idx ON institution_members(institution_id);
```

**Role Hierarchy:**

- **owner**: Full control, can delete institution
- **admin**: Can add/remove members, approve content
- **manager**: Can create/edit programs, startups, events
- **viewer**: Read-only access

#### 4. **institution_applications** (Onboarding Workflow)

```sql
CREATE TABLE institution_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(320) UNIQUE NOT NULL,
    type VARCHAR(120) NOT NULL,
    status VARCHAR(32) DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
    verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    remark TEXT,                           -- Admin feedback

    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    applicant_user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Same fields as institutions for Phase 2 onboarding
    tagline VARCHAR(280),
    city VARCHAR(180),
    country VARCHAR(180),
    -- ... (mirrors institution fields)

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Application Lifecycle:**

1. User submits Phase 1 (name, email, type) → `status='pending', verified=false`
2. Email verification link sent → `verified=true`
3. User completes Phase 2 (full details) → ready for admin review
4. Admin approves → `status='approved'`, institution created, `institution_id` set
5. User can now login and access dashboard

#### 5. **programs** (Institution Programs/Cohorts)

```sql
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
   type VARCHAR(120) NOT NULL,
   -- 'cohort', 'bootcamp', 'workshop', 'competition'
    description TEXT,
    duration VARCHAR(120),                 -- '3 months', '6 weeks'
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ
);
```

#### 6. **startups** (Startup Profiles - Kickstarter-style)

```sql
CREATE TYPE startup_stage AS ENUM
('idea', 'mvp', 'early_traction', 'growth', 'scale');
CREATE TYPE startup_status AS ENUM
('active', 'stealth', 'paused', 'acquired', 'shut_down');
CREATE TYPE funding_round AS ENUM
('bootstrapped', 'pre_seed', 'seed', 'series_a', 'series_b_plus', 'unicorn');

CREATE TABLE startups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE,              -- URL-friendly identifier
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(280),                  -- Short tagline
    pitch VARCHAR(160),                    -- One-line pitch
    description TEXT,                      -- Full story (Kickstarter-style)

    -- Visual identity
    logo VARCHAR(512),
    cover_image VARCHAR(512),              -- Hero banner

    -- Status & stage
    stage startup_stage,
    status startup_status DEFAULT 'active',
    founded_date TIMESTAMPTZ,

    -- Funding
    funding_round funding_round DEFAULT 'bootstrapped',
    funds_raised NUMERIC(16,2),
    funding_goal NUMERIC(16,2),
    funding_currency VARCHAR(8) DEFAULT 'USD',
    investors JSONB,                       -- Array of investor names

    -- Location
    city VARCHAR(180),
    country VARCHAR(180),
    location VARCHAR(255),

    -- Links
    website VARCHAR(255),
    linkedin VARCHAR(255),
    twitter VARCHAR(255),
    instagram VARCHAR(255),
    pitch_deck_url VARCHAR(512),
    demo_video_url VARCHAR(512),

    -- Focus areas
    industry VARCHAR(120),
    sectors JSONB,                         -- ['ai', 'healthtech']
    sdg_focus JSONB,                       -- ['sdg-3', 'sdg-9']

    -- Metrics
    team_size INTEGER,
    employee_count VARCHAR(50),
    highlights JSONB,                      -- Key achievements
    media_features JSONB,                  -- Press coverage

    -- Relations
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    primary_contact_email VARCHAR(320),

    profile_views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX startups_slug_idx ON startups(slug);
CREATE INDEX startups_status_idx ON startups(status);
CREATE INDEX startups_stage_idx ON startups(stage);

CREATE TYPE founder_role AS ENUM
('ceo', 'cto', 'coo', 'cfo', 'cpo', 'founder', 'co_founder');

CREATE TABLE startup_founders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(320) NOT NULL,
    role founder_role NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(startup_id, user_id)
);

CREATE INDEX startup_founders_startup_idx ON startup_founders(startup_id);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    role VARCHAR(120) NOT NULL,
    UNIQUE(user_id, startup_id)
);

CREATE TABLE startup_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,           -- 'created', 'updated', 'founder_added'
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX startup_activity_startup_idx ON startup_activity_logs(startup_id);
CREATE INDEX startup_activity_created_idx ON startup_activity_logs(created_at);
```

#### 7. **institution_sessions & startup_sessions** (OTP Login)

```sql
CREATE TABLE institution_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(320) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE startup_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(320) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX startup_sessions_email_idx ON startup_sessions(email);
CREATE INDEX startup_sessions_expires_idx ON startup_sessions(expires_at);
```

#### 8. **mentor_profiles** (Mentor Management)

```sql
CREATE TYPE mentor_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE mentor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expertise TEXT,
    rate NUMERIC(12,2),
    verified BOOLEAN DEFAULT FALSE,
    status mentor_status DEFAULT 'pending',
    occupation VARCHAR(255),
    packages TEXT,                         -- JSON or text describing packages
    achievements TEXT,
    availability TEXT,
    approved_at TIMESTAMPTZ,
    rejected_reason TEXT
);

CREATE INDEX mentor_profiles_user_idx ON mentor_profiles(user_id);
CREATE INDEX mentor_profiles_status_idx ON mentor_profiles(status);
```

#### 9. **approvers** (Admin Team)

```sql
CREATE TABLE approvers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(320) UNIQUE NOT NULL,
    mobile VARCHAR(50),
    employee_id VARCHAR(64) UNIQUE NOT NULL,  -- Auto-generated: XTR-001
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes Strategy

**Performance Indexes:**

```sql
-- Fast lookups
CREATE INDEX institutions_slug_idx ON institutions(slug);
CREATE INDEX institutions_status_idx ON institutions(status);
CREATE INDEX programs_institution_idx ON programs(institution_id);
CREATE INDEX startups_institution_idx ON startups(institution_id);
CREATE INDEX events_institution_idx ON events(institution_id);

-- RBAC queries
CREATE INDEX institution_members_institution_idx ON institution_members(institution_id);
CREATE INDEX institution_members_user_idx ON institution_members(user_id);

-- Session lookups
CREATE INDEX institution_sessions_email_idx ON institution_sessions(email);
CREATE INDEX institution_sessions_expires_idx ON institution_sessions(expires_at);
```

---

## Authentication & Authorization

### JWT Token Structure

```javascript
// Institution Token
{
  "sub": "user-uuid",
  "email": "institution@example.com",
  "institutionId": "inst-uuid",
  "type": "institution",
  "role": "owner",                       // owner, admin, manager, viewer
  "iat": 1737987654,
  "exp": 1738592454                      // 7 days
}

// Founder Token
{
  "sub": "user-uuid",
  "email": "founder@startup.com",
  "startupId": "startup-uuid",
  "type": "founder",
  "role": "ceo",                         // ceo, cto, founder, etc.
  "iat": 1737987654,
  "exp": 1738592454
}

// Xplorer Token (Credentials or Google)
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "explorer",
  "iat": 1737987654,
  "exp": 1738592454
}

// Mentor Token
{
  "sub": "user-uuid",
  "email": "mentor@example.com",
  "role": "mentor",
  "mentorProfileId": "mentor-uuid",
  "status": "approved",                  // pending, approved, rejected
  "iat": 1737987654,
  "exp": 1738592454
}
```

### Authentication Flows

#### 1. Institution Login (OTP-based)

```flow
┌─────────────────────────────────────────────────────────┐
│           INSTITUTION LOGIN FLOW (OTP-BASED)            │
└─────────────────────────────────────────────────────────┘

1. User enters email
   ↓
2. POST /api/institution-auth/request-otp
   - Check if application exists with email
   - Check if email is verified
   - Generate 6-digit OTP
   - Store in institution_sessions (expires in 10 min)
   - Send OTP via email
   ↓
3. User enters OTP
   ↓
4. POST /api/institution-auth/verify-otp
   - Validate OTP + session
   - Mark session as verified
   - Get application + institutionId
   - Generate JWT token
   - Return token
   ↓
5. Client stores token in localStorage
   ↓
6. All subsequent API calls include:
   Authorization: Bearer <token>
```

#### 2. Founder Login (OTP-based)

```flow
┌─────────────────────────────────────────────────────────┐
│             FOUNDER LOGIN FLOW (OTP-BASED)              │
└─────────────────────────────────────────────────────────┘

1. User enters email at /login
   ↓
2. POST /api/founder-auth/request-otp
   - Check if user exists with email
   - Check if user has any startups (as founder or owner)
   - Generate 6-digit OTP
   - Store in startup_sessions (expires in 10 min)
   - Send OTP via email
   ↓
3. User enters OTP
   ↓
4. POST /api/founder-auth/verify-otp
   - Validate OTP + sessionId
   - Mark session as verified
   - Get user's startup (if exists)
   - Generate JWT token with startupId
   - Return token + startupId
   ↓
5. Client stores token in localStorage
   ↓
6. Redirect to /dashboard (founder dashboard)
   ↓
7. All API calls include:
   Authorization: Bearer <token>
```

#### 3. Xplorer Authentication (Multi-Provider)

```flow
┌─────────────────────────────────────────────────────────┐
│        XPLORER LOGIN/SIGNUP (Credentials + Google)      │
└─────────────────────────────────────────────────────────┘

// Option A: Credentials (Password)
1. POST /api/xplorers/signup
   - Input: name, email, password, interests (up to 15)
   - Hash password with bcrypt
   - Create user (account_type='explorer')
   - Create explorer_profile with interests
   - Create auth_account (provider='credentials')
   - Generate JWT
   - Return token

2. POST /api/xplorers/login
   - Input: email, password
   - Find user by email
   - Verify password hash
   - Generate JWT
   - Return token

// Option B: Google OAuth
1. POST /api/xplorers/login/google
   - Input: Google ID token
   - Verify token with Google JWKS
   - Extract email, name, sub (Google user ID)
   - Find or create user
   - Create/update auth_account (provider='google')
   - Generate JWT
   - Return token

Note: Email is the primary identifier - multiple auth providers
can link to the same user account.
```

#### 4. Mentor Application & Approval

```flow
┌─────────────────────────────────────────────────────────┐
│            MENTOR ONBOARDING & APPROVAL FLOW            │
└─────────────────────────────────────────────────────────┘

1. User fills mentor signup form at /mentor-signup
   ↓
2. POST /api/mentors
   - Create user (if not exists)
   - Create mentor_profile (status='pending')
   - Store expertise, rate, occupation, etc.
   ↓
3. Admin/Approver reviews in dashboard
   ↓
4. POST /api/approvals/mentors
   - Input: mentorId, action ('approve' or 'reject'), reason
   - Update mentor_profile.status
   - If approved: set approved_at timestamp
   - Send approval/rejection email
   ↓
5. Mentor can login at /mentor-login (OTP-based)
   - Only approved mentors can access dashboard
```

### Session Validation (with Cache)

```flow
API Request with JWT
   ↓
┌─────────────────────────────┐
│ verifyInstitutionAuth()     │
├─────────────────────────────┤
│ 1. Extract token from       │
│    Authorization header     │
│    or cookie                │
├─────────────────────────────┤
│ 2. Check sessionCache       │──► Cache Hit → Return payload
│    (5-minute TTL)           │
├─────────────────────────────┤
│ 3. Cache Miss:              │
│    - Verify JWT signature   │
│    - Decode payload         │
├─────────────────────────────┤
│ 4. Ownership Validation:    │
│    - Query application by   │
│      email from token       │
│    - Verify institutionId   │
│      belongs to email       │
├─────────────────────────────┤
│ 5. Role Resolution:         │
│    - Check institution_     │
│      members table          │
│    - Default: 'owner'       │
├─────────────────────────────┤
│ 6. Cache result             │
├─────────────────────────────┤
│ 7. Return AuthResult        │
└─────────────────────────────┘
   ↓
Proceed to Controller
```

### Role-Based Access Control (RBAC)

```typescript
// Example: Only owners and admins can add team members
export async function POST(request: NextRequest) {
  const auth = await verifyInstitutionAuth(request);
  if (!auth.success) return auth.response;

  const roleCheck = requireRole(auth.payload, ['owner', 'admin']);
  if (roleCheck) return roleCheck.response;

  // ... proceed with team member creation
}
```

**Role Permissions Matrix:**

| Action | Owner | Admin | Manager | Viewer |
| ------ | ----- | ----- | ------- | ------ |
| View dashboard | ✅ | ✅ | ✅ | ✅ |
| Edit profile | ✅ | ✅ | ❌ | ❌ |
| Add team members | ✅ | ✅ | ❌ | ❌ |
| Remove team members | ✅ | ✅ | ❌ | ❌ |
| Create programs | ✅ | ✅ | ✅ | ❌ |
| Create startups | ✅ | ✅ | ✅ | ❌ |
| Delete institution | ✅ | ❌ | ❌ | ❌ |

---

## Data Flow

### Example: Create Program

```flow
┌──────────────────────────────────────────────────────────────┐
│ Client: POST /api/programs                                   │
│ Body: { name, type, description, duration }                  │
│ Headers: Authorization: Bearer <jwt>                         │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ Route Handler: app/api/programs/route.ts                    │
│ - Parse request body                                         │
│ - Call verifyInstitutionAuth()                              │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ Middleware: verifyInstitutionAuth()                         │
│ - Check cache                                                │
│ - Verify JWT                                                 │
│ - Validate institutionId ownership                          │
│ - Return { institutionId, email, role }                     │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ Controller: programController.create()                       │
│ - Validate input (name, type required)                      │
│ - Call repository                                            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ Repository: programRepository.create()                       │
│ - Execute Drizzle query                                      │
│ - Insert into programs table                                 │
│ - Return created record                                      │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ Database: PostgreSQL (Neon)                                  │
│ INSERT INTO programs (institution_id, name, type, ...)       │
│ RETURNING *                                                   │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ Response: 201 Created                                         │
│ { data: { id, name, type, institution_id, ... } }           │
└──────────────────────────────────────────────────────────────┘
```

---

## API Structure

### REST API Endpoints

#### Public Routes

```api
GET    /api/institutions                      # List published institutions
GET    /api/institutions/:slug                # Get institution by slug + programs/events
GET    /api/public/startups                   # List published startups
GET    /api/public/startups/:slug             # Get startup by slug
```

#### Institution Management

```api
POST   /api/institution-applications          # Submit Phase 1 (name, email, type)
GET    /api/institution-applications          # Get user's applications
PUT    /api/institution-applications/:id      # Update Phase 2 details
POST   /api/institution-applications/:id      # Submit for approval
PATCH  /api/institution-applications/:id      # Admin approve/reject

GET    /api/institutions/:id                  # Get institution details (protected)
PUT    /api/institutions/:id                  # Update institution (protected)
```

#### Institution Authentication

```api
POST   /api/institution-auth/request-otp      # Send OTP to email
POST   /api/institution-auth/verify-otp       # Verify OTP, return JWT
GET    /api/institution-auth/me               # Get current institution details
POST   /api/institution-auth/logout           # Clear session cache
```

#### Founder/Startup Authentication

```api
POST   /api/founder-auth/request-otp          # Send OTP to founder email
POST   /api/founder-auth/verify-otp           # Verify OTP, return JWT + startupId
```

#### Xplorer Authentication

```api
POST   /api/xplorers/signup                   # Create account (email/password)
POST   /api/xplorers/login                    # Login with credentials
POST   /api/xplorers/login/google             # Login with Google OAuth
GET    /api/xplorers/me                       # Get current xplorer profile
PUT    /api/xplorers/me                       # Update xplorer profile/interests
```

#### Founder/Startup Management (Protected)

```api
GET    /api/founder/startups                  # List founder's startups
POST   /api/founder/startups                  # Create new startup
GET    /api/founder/my-startup                # Get founder's primary startup
GET    /api/founder/startups/:id              # Get startup details
PUT    /api/founder/startups/:id              # Update startup
DELETE /api/founder/startups/:id              # Delete startup

GET    /api/founder/team                      # List startup team members
POST   /api/founder/team                      # Add team member
DELETE /api/founder/team/:id                  # Remove team member

GET    /api/founder/activity                  # Get activity logs
```

#### Institution Team Management (Protected)

```api
GET    /api/institution-team                  # List team members
POST   /api/institution-team                  # Add member (owner/admin only)
PUT    /api/institution-team/:id              # Update member role
DELETE /api/institution-team/:id              # Remove member
```

#### Programs (Protected)

```api
GET    /api/programs                          # List institution's programs
POST   /api/programs                          # Create program
GET    /api/programs/:id                      # Get program details
PUT    /api/programs/:id                      # Update program
DELETE /api/programs/:id                      # Delete program
```

#### Projects (Protected)

```api
GET    /api/projects                          # List institution's projects
POST   /api/projects                          # Create project
GET    /api/projects/:id                      # Get project details
PUT    /api/projects/:id                      # Update project
DELETE /api/projects/:id                      # Delete project
```

#### Startups - Institution Portfolio (Protected)

```api
GET    /api/startups                          # List institution's startups
POST   /api/startups                          # Add startup to portfolio
GET    /api/startups/:id                      # Get startup details
PUT    /api/startups/:id                      # Update startup
DELETE /api/startups/:id                      # Remove startup
```

#### Mentor Management

```api
POST   /api/mentors                           # Submit mentor application (public)
GET    /api/mentors                           # List mentors (filtered by status)
GET    /api/mentors/:id                       # Get mentor profile
PUT    /api/mentors/:id                       # Update mentor profile (protected)
```

#### Approvals (Admin/Approver only)

```api
POST   /api/approvals/mentors                 # Approve/reject mentor application
POST   /api/approvals/institutions            # Approve/reject institution application
GET    /api/approvals/mentors                 # List pending mentor applications
GET    /api/approvals/institutions            # List pending institution applications
```

#### Approver Management (Admin only)

```api
GET    /api/approvers                         # List approvers
POST   /api/approvers                         # Add new approver
                                              # (auto-gen employee ID)
DELETE /api/approvers/:id                     # Remove approver
```

#### Media Upload

```api
POST   /api/media                             # Upload to R2, return URL
                                              # Accepts: images (max 5MB)
                                              # Returns: { url, bucket,
                                              # key, size }
```

#### Dev/Testing (Non-production only)

```api
GET    /api/dev/mock-admin                    # Get admin JWT token
```

### Error Response Format

```json
{
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": { /* optional */ }
}
```

**Common Error Codes:**

- `AUTH_REQUIRED` (401)
- `INVALID_TOKEN` (401)
- `TOKEN_EXPIRED` (401)
- `FORBIDDEN` (403)
- `INVALID_SESSION` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)

---

## Security Layers

### 1. Input Validation

```typescript
// Controller level
if (!payload.name || !payload.email) {
  throw new HttpError(400, 'Name and email are required');
}

// Repository level uses Drizzle schema validation
```

### 2. SQL Injection Prevention

```typescript
// ✅ SAFE: Parameterized queries via Drizzle
await db.select().from(institutions).where(eq(institutions.email, userEmail));

// ❌ UNSAFE: Never do this
await db.execute(`SELECT * FROM institutions WHERE email = '${userEmail}'`);
```

### 3. Session Isolation

- Each institution's JWT contains their `institutionId` + `email`
- `verifyInstitutionAuth()` validates institutionId belongs to email
- Session cache keyed by token hash (not shared across users)

### 4. RBAC Enforcement

```typescript
const roleCheck = requireRole(auth.payload, ['owner', 'admin']);
if (roleCheck) return roleCheck.response; // 403 Forbidden
```

### 5. Rate Limiting (Middleware)

```typescript
// middleware.ts
if (pathname.startsWith('/api/institution-auth/request-otp')) {
  const limited = isRateLimited(`otp:${ip}`, 5, 60000); // 5 requests/min
  if (limited) return new Response('Too many requests', { status: 429 });
}
```

### 6. Secure Media Upload

```typescript
// Max file size: 5MB
// Allowed types: images only (jpeg, png, webp)
// Random UUID filenames (prevent enumeration)
// Uploaded to private R2 bucket, public URL returned
```

### 7. Environment Variables

```bash
JWT_SECRET=<strong-secret>           # JWT signing key
DATABASE_URL=<neon-connection-string>
R2_ACCESS_KEY=<cloudflare-key>
R2_SECRET_ACCESS_KEY=<cloudflare-secret>
SMTP_USER=<email>
SMTP_PASS=<app-password>
```

---

## Performance Optimizations

### 1. Session Caching

- In-memory cache with 5-minute TTL
- Reduces DB queries by 80% for authenticated requests
- Auto-cleanup of expired sessions

### 2. Database Indexes

- Slug-based lookups: O(1) hash index
- Status filtering: B-tree index
- Foreign key queries: Indexed

### 3. Parallel Data Fetching

```typescript
// Dashboard loads 4 API calls in parallel
const [startups, team, programs, institution] = await Promise.all([
  fetch('/api/startups'),
  fetch('/api/institution-team'),
  fetch('/api/programs'),
  fetch('/api/institution-auth/me'),
]);
```

### 4. Lazy Loading

- Programs/startups loaded only when user navigates to those pages
- Media assets loaded on-demand

---

## Deployment Considerations

### Production Checklist

- [ ] Set strong `JWT_SECRET` (use `openssl rand -base64 32`)
- [ ] Enable HTTPS only
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS properly
- [ ] Add Redis for session cache (replace in-memory)
- [ ] Set up database connection pooling
- [ ] Enable rate limiting per user (not just IP)
- [ ] Add API request logging (Winston/Pino)
- [ ] Set up error monitoring (Sentry)
- [ ] Configure CDN for R2 assets
- [ ] Enable database query logging (slow queries)
- [ ] Set up backup strategy for PostgreSQL

### Scaling Strategy

1. **Horizontal Scaling**: Add more Next.js instances behind load balancer
2. **Redis**: Move session cache to Redis (shared across instances)
3. **Database**: Neon auto-scales, consider read replicas for heavy read workloads
4. **CDN**: Use Cloudflare CDN in front of R2 for media assets
5. **Background Jobs**: Move email sending to queue (Bull/BullMQ)

---

## Future Enhancements

### Authentication & Security

1. **2FA/MFA**: Add two-factor authentication for sensitive accounts
2. **OAuth Providers**: Add LinkedIn, GitHub authentication
3. **Session Management**: Redis-based session store for multi-instance deployment
4. **API Rate Limiting**: Per-user quotas based on plan/role
5. **Audit Logs**: Track all admin actions (who did what, when)

### Platform Features

1. **Mentor Booking System**: Complete booking/payment flow for mentor sessions
2. **Investor Verification**: Identity + funds verification workflow
3. **Messaging System**: In-app chat between founders/mentors/institutions
4. **Notifications**: Real-time notifications via WebSockets + email
5. **Analytics Dashboard**: Track user behavior, startup metrics, funding trends
6. **Advanced Search**: Full-text search with Elasticsearch (institutions/startups/mentors)
7. **Recommendation Engine**: ML-based matching (founders <-> mentors <-> institutions)

### Content & Media

1. **File Virus Scanning**: Scan uploaded files before storing in R2
2. **Image Optimization**: Auto-resize/compress images on upload
3. **Video Platform**: Integrate video hosting for pitch videos
4. **Document Management**: Version control for legal documents

### Infrastructure

1. **GraphQL API**: Add GraphQL layer for complex queries
2. **Multi-region**: Deploy to multiple regions for low latency
3. **Background Jobs**: Bull/BullMQ for email sending, data processing
4. **Monitoring**: Sentry error tracking, DataDog metrics
5. **CDN**: Cloudflare CDN for R2 assets

---

## Quick Reference

### Key Files

**Database & Schema:**

- `db/schemas/index.ts` - All database tables and enums
- `db/client.ts` - Drizzle database connection
- `drizzle.config.ts` - Migration configuration

**Authentication & Middleware:**

- `server/middleware/institutionAuth.ts` - Institution auth logic
- `server/services/auth.ts` - JWT operations, xplorer auth, password hashing
- `server/services/sessionCache.ts` - Session cache (5min TTL)

**API Routes:**

- `app/api/institution-auth/` - Institution OTP login
- `app/api/founder-auth/` - Founder OTP login
- `app/api/xplorers/` - Xplorer signup/login
- `app/api/mentors/` - Mentor applications
- `app/api/approvals/` - Admin approval endpoints
- `app/api/founder/` - Founder dashboard APIs
- `app/api/**/route.ts` - All API endpoints

**Business Logic:**

- `server/controllers/*.controller.ts` - Controllers for each entity
- `server/controllers/http-error.ts` - Custom error class

**Data Access:**

- `server/repositories/*.repository.ts` - Database queries
- `server/repositories/user.repository.ts` - User & profile management
- `server/repositories/startup.repository.ts` - Startup CRUD with founders

**External Services:**

- `server/services/storage.ts` - Cloudflare R2 uploads
- `server/services/email.ts` - SMTP email with HTML templates
- `server/utils/password.ts` - bcrypt password hashing

**Client State:**

- `stores/useStartupOnboardingStore.ts` - Zustand store for startup onboarding
- `stores/useInstitutionStore.ts` - Institution state management
- `stores/useProjectStore.ts` - Project state management
- `contexts/AuthContext.tsx` - Admin UI auth context (mock)

### Environment Setup

```bash
# Install dependencies
npm install

# Generate Drizzle migrations
npm run db:generate

# Apply migrations
npm run db:push

# Run dev server
npm run dev
```

### Testing Authentication

```bash
# Get admin JWT (dev only)
curl http://localhost:3000/api/dev/mock-admin

# Test protected endpoint
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/institution-team
```
