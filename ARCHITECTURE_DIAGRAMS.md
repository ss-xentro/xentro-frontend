# Xentro Architecture - Mermaid Diagrams

This document contains detailed Mermaid diagrams for visualizing the Xentro platform architecture.

---

## 1. System Overview - Technology Stack

```mermaid
graph TB
    subgraph Frontend["Frontend Layer"]
        A[Next.js 16 App Router]
        B[React + TypeScript]
        C[Tailwind CSS]
    end

    subgraph Backend["Backend Layer"]
        D[Next.js API Routes]
        E[Route Handlers]
    end

    subgraph Data["Data Layer"]
        F[Drizzle ORM]
        G[PostgreSQL - Neon]
        H[Cloudflare R2 S3]
    end

    subgraph Services["External Services"]
        I[SMTP - Nodemailer]
        J[JWT - jose]
    end

    A --> D
    B --> D
    C --> A
    D --> F
    E --> F
    F --> G
    D --> H
    D --> I
    D --> J

    style Frontend fill:#e1f5ff
    style Backend fill:#fff4e1
    style Data fill:#e8f5e9
    style Services fill:#f3e5f5
```

---

## 2. Backend Layered Architecture

```mermaid
graph TD
    Client[Client Request] --> Layer1

    subgraph Layer1["Layer 1: API Routes"]
        A1[app/api/**/route.ts]
        A2[Request Parsing]
        A3[Response Formatting]
        A4[Error Handling]
    end

    Layer1 --> Layer2

    subgraph Layer2["Layer 2: Middleware"]
        B1[verifyInstitutionAuth]
        B2[requireRole]
        B3[Session Cache]
        B4[Rate Limiting]
    end

    Layer2 --> Layer3

    subgraph Layer3["Layer 3: Controllers"]
        C1[Business Logic]
        C2[Input Validation]
        C3[Service Orchestration]
        C4[HttpError Throwing]
    end

    Layer3 --> Layer4

    subgraph Layer4["Layer 4: Repositories"]
        D1[Database Queries]
        D2[Drizzle ORM]
        D3[Data Mapping]
        D4[CRUD Operations]
    end

    Layer4 --> Layer5

    subgraph Layer5["Layer 5: Services"]
        E1[R2 Storage]
        E2[SMTP Email]
        E3[JWT Operations]
        E4[Session Cache]
    end

    Layer5 --> Database[(PostgreSQL<br/>Neon Serverless)]
    Layer5 --> Storage[(Cloudflare R2<br/>Storage)]

    style Layer1 fill:#ffebee
    style Layer2 fill:#fff3e0
    style Layer3 fill:#e8f5e9
    style Layer4 fill:#e3f2fd
    style Layer5 fill:#f3e5f5
    style Database fill:#c8e6c9
    style Storage fill:#b3e5fc
```

---

## 3. Database Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ explorer_profiles : has
    users ||--o{ mentor_profiles : has
    users ||--o{ investor_profiles : has
    users ||--o{ auth_accounts : has
    users ||--o{ team_members : has
    users ||--o{ institution_members : has

    institution_applications ||--o| institutions : "creates"
    institution_applications }o--|| users : "submitted_by"

    institutions ||--o{ institution_members : has
    institutions ||--o{ programs : offers
    institutions ||--o{ startups : supports
    institutions ||--o{ events : hosts
    institutions ||--o{ projects : manages
    institutions ||--o{ institution_sessions : has

    startups ||--o{ team_members : has
    startups }o--|| users : "owned_by"

    institutions ||--o{ media_assets : has
    startups ||--o{ media_assets : has
    mentor_profiles ||--o{ media_assets : has

    mentor_profiles ||--o{ bookings : has
    startups ||--o{ bookings : makes
    bookings ||--o| sessions : generates
    bookings ||--o| payments : requires

    users {
        uuid id PK
        string name
        string email UK
        string phone
        enum account_type
        timestamp created_at
    }

    institutions {
        uuid id PK
        string slug UK
        string name
        string type
        string email UK
        string status
        int profile_views
        boolean verified
        json sdg_focus
        json sector_focus
        json legal_documents
        timestamp created_at
    }

    institution_applications {
        uuid id PK
        string name
        string email UK
        string type
        string status
        boolean verified
        string verification_token
        uuid institution_id FK
        uuid applicant_user_id FK
        timestamp created_at
    }

    institution_members {
        uuid id PK
        uuid institution_id FK
        uuid user_id FK
        enum role
        uuid invited_by_user_id FK
        boolean is_active
        timestamp invited_at
    }

    programs {
        uuid id PK
        uuid institution_id FK
        string name
        string type
        text description
        string duration
        boolean is_active
        timestamp start_date
        timestamp end_date
    }

    startups {
        uuid id PK
        string name
        string stage
        string location
        string one_liner
        uuid institution_id FK
        uuid owner_id FK
    }

    mentor_profiles {
        uuid id PK
        uuid user_id FK
        text expertise
        numeric rate
        boolean verified
        enum status
        string occupation
        text packages
        text achievements
        text availability
    }

    media_assets {
        uuid id PK
        string bucket
        string key
        text url
        string mime_type
        bigint size
        string entity_type
        uuid entity_id
        timestamp created_at
    }
```

---

## 4. Institution Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant Auth as /api/institution-auth
    participant DB as Database
    participant Email as SMTP Service
    participant Cache as Session Cache

    User->>UI: Enter email
    UI->>Auth: POST /request-otp
    Auth->>DB: Check application exists
    Auth->>DB: Verify email verified=true
    DB-->>Auth: Application found
    Auth->>Auth: Generate 6-digit OTP
    Auth->>DB: Store in institution_sessions
    Auth->>Email: Send OTP email
    Email-->>User: Receive OTP
    Auth-->>UI: OTP sent successfully

    User->>UI: Enter OTP code
    UI->>Auth: POST /verify-otp
    Auth->>DB: Validate OTP & session
    DB-->>Auth: Session valid
    Auth->>Auth: Generate JWT token
    Auth->>Cache: Cache session (5min TTL)
    Auth-->>UI: Return JWT + institution data
    UI->>UI: Store token in localStorage

    User->>UI: Access dashboard
    UI->>Auth: GET /me (Authorization: Bearer token)
    Auth->>Cache: Check cache
    alt Cache Hit
        Cache-->>Auth: Return cached payload
    else Cache Miss
        Auth->>Auth: Verify JWT signature
        Auth->>DB: Validate institutionId ownership
        DB-->>Auth: Ownership confirmed
        Auth->>Cache: Store in cache
    end
    Auth-->>UI: Return institution details
    UI-->>User: Show dashboard
```

---

## 5. Role-Based Access Control (RBAC)

```mermaid
graph TD
    Request[API Request] --> ExtractToken[Extract JWT Token]
    ExtractToken --> VerifyAuth[verifyInstitutionAuth]

    VerifyAuth --> CheckCache{Check<br/>Session Cache?}
    CheckCache -->|Hit| ReturnCached[Return Cached Payload]
    CheckCache -->|Miss| VerifyJWT[Verify JWT Signature]

    VerifyJWT --> QueryDB[Query Application & Institution]
    QueryDB --> GetRole[Resolve User Role]
    GetRole --> CacheResult[Cache Result 5min]
    CacheResult --> ReturnPayload[Return Auth Payload]
    ReturnCached --> CheckRole
    ReturnPayload --> CheckRole{Check Required<br/>Role?}

    CheckRole -->|No Role Required| ProceedController[Proceed to Controller]
    CheckRole -->|Role Required| RequireRole[requireRole Middleware]

    RequireRole --> HasPermission{Has<br/>Permission?}
    HasPermission -->|Yes| ProceedController
    HasPermission -->|No| Return403[Return 403 Forbidden]

    ProceedController --> ExecuteLogic[Execute Business Logic]
    ExecuteLogic --> Repository[Call Repository]
    Repository --> Database[(Database)]
    Database --> Response[Return Response]

    style Request fill:#e1f5ff
    style CheckCache fill:#fff9c4
    style CheckRole fill:#fff9c4
    style HasPermission fill:#fff9c4
    style Return403 fill:#ffcdd2
    style ProceedController fill:#c8e6c9
    style Response fill:#c8e6c9
```

---

## 6. Data Flow: Create Program Example

```mermaid
sequenceDiagram
    participant Client
    participant Route as API Route<br/>/api/programs
    participant Auth as verifyInstitutionAuth
    participant Cache as Session Cache
    participant Controller as programController
    participant Repo as programRepository
    participant DB as PostgreSQL

    Client->>Route: POST /api/programs<br/>Authorization: Bearer {token}<br/>Body: {name, type, duration}

    Route->>Auth: Verify authentication
    Auth->>Cache: Check token cache
    alt Cache Hit
        Cache-->>Auth: Return cached payload
    else Cache Miss
        Auth->>Auth: Verify JWT signature
        Auth->>DB: Validate institutionId
        DB-->>Auth: Ownership confirmed
        Auth->>Cache: Store in cache (5min)
    end
    Auth-->>Route: {institutionId, email, role}

    Route->>Controller: create(data, institutionId)
    Controller->>Controller: Validate input<br/>(name & type required)
    Controller->>Repo: create(programData)
    Repo->>DB: INSERT INTO programs<br/>(institution_id, name, type, ...)
    DB-->>Repo: RETURNING *
    Repo-->>Controller: Created program object
    Controller-->>Route: Program created
    Route-->>Client: 201 Created<br/>{data: {id, name, type, ...}}
```

---

## 7. API Endpoint Structure

```mermaid
graph LR
    subgraph Public["Public APIs"]
        P1[GET /api/institutions]
        P2[GET /api/institutions/:slug]
        P3[POST /api/institution-applications]
    end

    subgraph Auth["Authentication"]
        A1[POST /api/institution-auth/request-otp]
        A2[POST /api/institution-auth/verify-otp]
        A3[GET /api/institution-auth/me]
        A4[POST /api/institution-auth/logout]
    end

    subgraph Protected["Protected APIs - Authenticated"]
        subgraph Team["Team Management"]
            T1[GET /api/institution-team]
            T2[POST /api/institution-team]
            T3[PUT /api/institution-team/:id]
            T4[DELETE /api/institution-team/:id]
        end

        subgraph Programs["Programs"]
            PR1[GET /api/programs]
            PR2[POST /api/programs]
            PR3[PUT /api/programs/:id]
            PR4[DELETE /api/programs/:id]
        end

        subgraph Startups["Startups"]
            S1[GET /api/startups]
            S2[POST /api/startups]
            S3[PUT /api/startups/:id]
            S4[DELETE /api/startups/:id]
        end

        subgraph Projects["Projects"]
            PJ1[GET /api/projects]
            PJ2[POST /api/projects]
            PJ3[PUT /api/projects/:id]
            PJ4[DELETE /api/projects/:id]
        end
    end

    subgraph Media["Media Upload"]
        M1[POST /api/media]
    end

    subgraph Admin["Admin Only"]
        AD1[PATCH /api/institution-applications/:id]
        AD2[POST /api/approvers]
        AD3[GET /api/approvers]
    end

    style Public fill:#e8f5e9
    style Auth fill:#fff3e0
    style Protected fill:#e3f2fd
    style Media fill:#f3e5f5
    style Admin fill:#ffebee
```

---

## 8. Institution Application Lifecycle

```mermaid
stateDiagram-v2
    [*] --> EmailEntry: User enters email
    EmailEntry --> Phase1: Submit basic info

    state Phase1 {
        [*] --> Pending: status='pending'
        Pending --> EmailSent: Send verification link
        EmailSent --> VerificationClick: User clicks link
        VerificationClick --> Verified: verified=true
    }

    Phase1 --> Phase2Dashboard: Access dashboard

    state Phase2Dashboard {
        [*] --> DraftForm: 13-step onboarding
        DraftForm --> FillingDetails: Add info (type, name, city, etc)
        FillingDetails --> Validation: Validate required fields
        Validation --> ReadyForReview: All fields complete
        ReadyForReview --> Submitted: Submit for approval
    }

    Submitted --> AdminReview

    state AdminReview {
        [*] --> PendingApproval: status='pending'
        PendingApproval --> Approved: Admin approves
        PendingApproval --> Rejected: Admin rejects
    }

    Approved --> CreateInstitution: Create institution record
    CreateInstitution --> AssignOwner: Set applicant as owner
    AssignOwner --> GrantAccess: Enable full dashboard
    GrantAccess --> [*]

    Rejected --> NotifyUser: Send rejection email
    NotifyUser --> [*]

    note right of Phase1
        User receives magic link
        Email verification required
    end note

    note right of Phase2Dashboard
        Logo upload
        SDG & sector selection
        Legal documents
        Impact metrics
    end note

    note right of AdminReview
        Admin can add remark
        Applicant notified via email
    end note
```

---

## 9. Directory Structure

```mermaid
graph TD
    Root[xentro_app/]

    Root --> App[app/]
    Root --> Server[server/]
    Root --> DB[db/]
    Root --> Components[components/]
    Root --> Lib[lib/]

    App --> AppRoutes[Routes]
    AppRoutes --> Admin["(admin)/<br/>login, dashboard"]
    AppRoutes --> Institution["(institution)/<br/>dashboard, edit"]
    AppRoutes --> Public["(public)/<br/>onboarding, institutions"]
    AppRoutes --> API[api/]

    API --> APIEndpoints[Endpoints]
    APIEndpoints --> APIAuth[institution-auth/]
    APIEndpoints --> APITeam[institution-team/]
    APIEndpoints --> APIPrograms[programs/]
    APIEndpoints --> APIStartups[startups/]
    APIEndpoints --> APIMedia[media/]

    Server --> Controllers[controllers/]
    Server --> Middleware[middleware/]
    Server --> Repositories[repositories/]
    Server --> Services[services/]
    Server --> Utils[utils/]

    Controllers --> ControllerFiles["http-error.ts<br/>institution.controller.ts<br/>institutionApplication.controller.ts"]

    Middleware --> MiddlewareFiles["institutionAuth.ts"]

    Repositories --> RepoFiles["institution.repository.ts<br/>program.repository.ts<br/>startup.repository.ts<br/>user.repository.ts"]

    Services --> ServiceFiles["auth.ts<br/>sessionCache.ts<br/>storage.ts<br/>email.ts<br/>password.ts"]

    DB --> DBSchemas[schemas/index.ts]
    DB --> DBClient[client.ts]

    Components --> UIComponents[ui/]
    Components --> InstComponents[institution/]
    Components --> OnboardComponents[onboarding/]

    Lib --> LibFiles["types.ts<br/>utils.ts<br/>data.ts"]

    style Root fill:#e1f5ff
    style App fill:#fff3e0
    style Server fill:#e8f5e9
    style DB fill:#f3e5f5
    style Components fill:#ffebee
    style Lib fill:#e0f2f1
```

---

## 10. Security Layers

```mermaid
graph TB
    Request[Incoming Request] --> Layer1

    subgraph Layer1["1. Input Validation"]
        V1[Request Body Validation]
        V2[Type Checking]
        V3[Required Fields]
    end

    Layer1 --> Layer2

    subgraph Layer2["2. Authentication"]
        A1[JWT Token Verification]
        A2[Token Expiry Check]
        A3[Signature Validation]
    end

    Layer2 --> Layer3

    subgraph Layer3["3. Authorization"]
        Z1[Ownership Validation]
        Z2[Role-Based Access Control]
        Z3[Resource Permission Check]
    end

    Layer3 --> Layer4

    subgraph Layer4["4. Rate Limiting"]
        R1[IP-based Throttling]
        R2[OTP Request Limits]
        R3[API Quota Enforcement]
    end

    Layer4 --> Layer5

    subgraph Layer5["5. SQL Injection Prevention"]
        S1[Parameterized Queries]
        S2[Drizzle ORM]
        S3[No Raw SQL]
    end

    Layer5 --> Layer6

    subgraph Layer6["6. Session Security"]
        SS1[Session Cache Isolation]
        SS2[Token Hashing]
        SS3[5-minute TTL]
    end

    Layer6 --> Layer7

    subgraph Layer7["7. Media Upload Security"]
        M1[File Type Validation]
        M2[5MB Size Limit]
        M3[Random UUID Filenames]
        M4[Content-Type Checking]
    end

    Layer7 --> ProcessRequest[Process Request]
    ProcessRequest --> Response[Secure Response]

    style Layer1 fill:#ffebee
    style Layer2 fill:#fff3e0
    style Layer3 fill:#fff9c4
    style Layer4 fill:#f3e5f5
    style Layer5 fill:#e8f5e9
    style Layer6 fill:#e3f2fd
    style Layer7 fill:#fce4ec
    style ProcessRequest fill:#c8e6c9
    style Response fill:#c8e6c9
```

---

## 11. Mentor & Xplorer Ecosystem

```mermaid
graph TB
    subgraph Users["User Types"]
        Explorer[Explorer/Xplorer<br/>Students/Entrepreneurs]
        Mentor[Mentor/Coach<br/>Industry Experts]
        Startup[Startup Team<br/>Founders]
        Institution[Institution<br/>Incubators/Accelerators]
        Investor[Investor<br/>VCs/Angels]
    end

    Explorer -->|Signs up| ExplorerFlow
    Mentor -->|Applies| MentorFlow
    Startup -->|Joins| StartupFlow
    Institution -->|Onboards| InstitutionFlow

    subgraph ExplorerFlow["Explorer Journey"]
        E1[Signup: Name, Email, Password]
        E2[Select Interests up to 15]
        E3[Google OAuth Option]
        E4[Browse Institutions]
        E5[Book Mentor Sessions]
        E6[Join Programs]
    end

    subgraph MentorFlow["Mentor Journey"]
        M1[Apply as Mentor]
        M2[status='pending']
        M3[Admin Approval]
        M4[status='approved']
        M5[Setup Packages & Pricing]
        M6[Set Availability]
        M7[Accept Bookings]
    end

    subgraph StartupFlow["Startup Journey"]
        S1[Added by Institution]
        S2[Team Members Invited]
        S3[Profile Creation]
        S4[Access Mentor Network]
        S5[Apply to Programs]
    end

    subgraph InstitutionFlow["Institution Journey"]
        I1[Submit Application]
        I2[Email Verification]
        I3[Complete Onboarding]
        I4[Admin Approval]
        I5[Publish Profile]
        I6[Add Programs]
        I7[Manage Startups]
        I8[Host Events]
    end

    E1 --> E2
    E2 --> E3
    E3 --> E4
    E4 --> E5
    E5 --> E6

    M1 --> M2
    M2 --> M3
    M3 --> M4
    M4 --> M5
    M5 --> M6
    M6 --> M7

    S1 --> S2
    S2 --> S3
    S3 --> S4
    S4 --> S5

    I1 --> I2
    I2 --> I3
    I3 --> I4
    I4 --> I5
    I5 --> I6
    I6 --> I7
    I7 --> I8

    style Users fill:#e1f5ff
    style ExplorerFlow fill:#e8f5e9
    style MentorFlow fill:#fff3e0
    style StartupFlow fill:#f3e5f5
    style InstitutionFlow fill:#e3f2fd
```

---

## 12. Performance Optimization Strategy

```mermaid
graph TD
    Optimization[Performance Optimization]

    Optimization --> Cache[Session Caching]
    Optimization --> Index[Database Indexing]
    Optimization --> Parallel[Parallel Data Fetching]
    Optimization --> Lazy[Lazy Loading]

    subgraph Cache["Session Caching Strategy"]
        C1[In-Memory Cache]
        C2[5-Minute TTL]
        C3[Token Hash as Key]
        C4[80% Query Reduction]
        C5[Auto-Cleanup Expired]
    end

    subgraph Index["Database Index Strategy"]
        I1[Slug: Hash Index O1]
        I2[Status: B-tree Index]
        I3[Foreign Keys: Indexed]
        I4[Email: Unique Index]
        I5[Session Expiry: Index]
    end

    subgraph Parallel["Parallel Fetching"]
        P1[Dashboard: 4 API calls]
        P2[Promise.all]
        P3[Startups + Team + Programs]
        P4[Non-blocking UI]
    end

    subgraph Lazy["Lazy Loading"]
        L1[Load on Navigation]
        L2[Media: On-demand]
        L3[Programs: Tab Switch]
        L4[Reduce Initial Bundle]
    end

    Cache --> Benefit1[Faster Auth]
    Index --> Benefit1
    Parallel --> Benefit2[Faster Page Load]
    Lazy --> Benefit2

    Benefit1 --> Result[Improved UX]
    Benefit2 --> Result

    style Optimization fill:#e1f5ff
    style Cache fill:#e8f5e9
    style Index fill:#fff3e0
    style Parallel fill:#f3e5f5
    style Lazy fill:#e3f2fd
    style Result fill:#c8e6c9
```

---

## 13. Deployment Architecture

```mermaid
graph TB
    subgraph Internet["Internet"]
        User[Users]
        CDN[Cloudflare CDN]
    end

    User --> CDN
    CDN --> LB[Load Balancer]

    subgraph Compute["Compute Layer - Vercel/AWS"]
        LB --> App1[Next.js Instance 1]
        LB --> App2[Next.js Instance 2]
        LB --> App3[Next.js Instance N]
    end

    subgraph Cache["Cache Layer"]
        Redis[(Redis<br/>Session Cache)]
    end

    App1 --> Redis
    App2 --> Redis
    App3 --> Redis

    subgraph Database["Database Layer"]
        Primary[(Neon Primary<br/>PostgreSQL)]
        Replica1[(Read Replica 1)]
        Replica2[(Read Replica 2)]
    end

    App1 --> Primary
    App2 --> Primary
    App3 --> Primary

    App1 --> Replica1
    App2 --> Replica2

    Primary --> Replica1
    Primary --> Replica2

    subgraph Storage["Storage Layer"]
        R2[(Cloudflare R2<br/>Media Assets)]
    end

    App1 --> R2
    App2 --> R2
    App3 --> R2

    CDN --> R2

    subgraph Monitoring["Monitoring & Logging"]
        Sentry[Sentry<br/>Error Tracking]
        Analytics[Analytics<br/>Dashboard]
        Logs[Winston/Pino<br/>Logs]
    end

    App1 --> Sentry
    App1 --> Analytics
    App1 --> Logs

    subgraph External["External Services"]
        SMTP[SMTP Server<br/>Email Delivery]
        Queue[Bull/BullMQ<br/>Background Jobs]
    end

    App1 --> SMTP
    App1 --> Queue

    style Internet fill:#e1f5ff
    style Compute fill:#e8f5e9
    style Cache fill:#fff3e0
    style Database fill:#e3f2fd
    style Storage fill:#f3e5f5
    style Monitoring fill:#ffebee
    style External fill:#f3e5f5
```

---

## How to Use These Diagrams

### ⚠️ Important: Copy Individual Diagrams Only

Each diagram in this document is wrapped in triple backticks with `mermaid` syntax. **Do not copy the entire file** into a Mermaid renderer.

### Viewing Options

**Option 1: GitHub (Recommended)**

- Push this file to GitHub
- View directly in the repository (GitHub renders Mermaid automatically)
- No additional setup required

**Option 2: VS Code**

- Install "Markdown Preview Mermaid Support" extension
- Open this file and click "Preview" (Cmd+Shift+V on Mac)

**Option 3: Mermaid Live Editor**

1. Go to [mermaid.live](https://mermaid.live)
2. **Copy only the code between the triple backticks** from one diagram section
3. Paste into the editor (left panel)
4. View rendered diagram (right panel)

**Example - Copy this code only:**

```mermaid
graph TB
    A[Start] --> B[End]
```

**Do NOT copy:**

```mermaid
graph TB
    A[Start] --> B[End]
```

### Customization

- Modify colors using `style` directives
- Change layout direction: `TB` (top-bottom), `LR` (left-right)
- Add/remove nodes and connections as needed

## Legend

- **Blue boxes**: Frontend/Client layer
- **Green boxes**: Backend/Server layer
- **Yellow boxes**: Decision points/Cache
- **Purple boxes**: External services
- **Red boxes**: Error states
- **Cylinders**: Databases/Storage

---

## Generated for Xentro Backend Architecture Documentation
