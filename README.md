# PulseCRM

A multi-tenant CRM built as `Company → Team → User`, with JWT authentication,
rotating refresh tokens, and role-based access control (RBAC).

## Monorepo layout

```
PulseCRM/
├── pulsecrm-backend/    Node.js + Express + Prisma (Postgres) API
└── pulsecrm-frontend/   React + Vite + Tailwind CSS SPA
```

## Architecture at a glance

- **Auth**: bcrypt-hashed passwords, short-lived JWT access tokens (15m),
  rotating refresh tokens (7d) stored hashed in the database with reuse
  detection (see [`REFRESH_TOKENS.md`](./pulsecrm-backend/docs/REFRESH_TOKENS.md)).
- **Multi-tenancy**: every domain row (`Team`, `User`, `Invitation`, and future
  CRM records) carries a `companyId`, and every query is scoped to
  `req.user.companyId` — no cross-tenant reads or writes are possible through
  the API.
- **RBAC**: three roles — `ADMIN`, `MANAGER`, `REP` — enforced via a single
  `authorize(...roles)` middleware applied per-route (see
  `pulsecrm-backend/src/middleware/authorize.js`).
- **Layering**: routes → controllers (thin) → services (business logic) →
  Prisma. Validation is a middleware step (`zod` schemas) before the
  controller ever runs.

## Quick start

### 1. Backend

```bash
cd pulsecrm-backend
npm install
cp .env.example .env        # fill in DATABASE_URL, JWT secrets, SMTP creds
npx prisma generate
npx prisma migrate deploy   # applies all migrations, including RefreshToken/Invitation
npm run seed                # creates a demo Company/Team + Admin/Manager/Rep users
npm run dev                 # http://localhost:5000
```

API docs: `http://localhost:5000/api-docs`

### 2. Frontend

```bash
cd pulsecrm-frontend
npm install
cp .env.example .env         # set VITE_API_URL=http://localhost:5000
npm run dev                  # http://localhost:5173
```

### 3. Log in with the seeded users

| Role    | Email                | Password       |
|---------|-----------------------|----------------|
| Admin   | admin@pulsecrm.dev    | ChangeMe123!   |
| Manager | manager@pulsecrm.dev  | ChangeMe123!   |
| Rep     | rep@pulsecrm.dev      | ChangeMe123!   |

(Password is whatever `SEED_PASSWORD` is set to in your `.env`, default shown above.)
**Change these before deploying anywhere but local dev.**

## Testing

```bash
cd pulsecrm-backend
cp .env.example .env.test    # point this at a disposable test database
npm test
```

See [`pulsecrm-backend/README.md`](./pulsecrm-backend/README.md) for details
on what's covered (unit tests for pure logic, integration tests for every
API route including RBAC and tenant-isolation checks).

## Sprint status (Week 2 — Auth & RBAC foundation)

| Area | Status |
|---|---|
| Registration / Login / Logout | ✅ |
| JWT auth + rotating refresh tokens with reuse detection | ✅ |
| Email verification / forgot / reset password | ✅ |
| `authenticate` + `authorize(...roles)` middleware, applied to every protected route | ✅ |
| Company API (get/update, tenant-scoped) | ✅ |
| Team API (CRUD, tenant-scoped) | ✅ |
| User API (list, role assignment, team assignment, activate/deactivate) | ✅ |
| Invitation flow (invite → email → accept → auto-login) | ✅ |
| Seed script (Company, Team, Admin/Manager/Rep) | ✅ |
| Jest + Supertest tests (unit + integration, RBAC + tenant isolation covered) | ✅ |
| Swagger/OpenAPI docs (JSDoc above every route) | ✅ |
| Frontend: Login/Register/Forgot/Reset/Verify screens, protected routes, Redux auth state | ✅ |
| Frontend: role-based navigation (hide nav items by role) | ⏳ not yet — next sprint |
| Company/Team/Invitation UI screens | ⏳ not yet — next sprint (APIs are ready to consume) |

## Contributing

- Keep controllers thin — business logic belongs in `src/services/*`.
- Every new route needs: `authenticate` (if protected) → `authorize(...roles)`
  (if role-gated) → `validate(schema)` (if it takes a body) → controller.
- Every new endpoint needs a matching `@openapi` JSDoc block and at least one
  integration test.
- All queries must be scoped by `companyId` — there is no global "list
  everything" endpoint anywhere in this API.
