# pulsecrm-backend

Express + Prisma (Postgres) API for PulseCRM.

## Stack

- **Express 5**, **Prisma 7** (with the `@prisma/adapter-pg` driver adapter)
- **JWT** access + refresh tokens, **bcrypt** password hashing
- **zod** for request validation
- **swagger-jsdoc** / **swagger-ui-express** for live API docs
- **Jest** + **Supertest** for testing

## Setup

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL and the JWT secrets at minimum
npx prisma generate
npx prisma migrate deploy
npm run seed               # optional but recommended — creates demo data
npm run dev
```

The server starts on `http://localhost:5000` (or `$PORT`). Interactive API
docs are at `http://localhost:5000/api-docs`.

## Folder structure

```
src/
├── app.js                Express app: middleware, route mounting, error handler
├── server.js             Boots the HTTP server
├── config/swagger.js      swagger-jsdoc setup (reads JSDoc from src/routes/*.js)
├── routes/                 Route definitions + @openapi JSDoc annotations
├── controllers/            Thin request/response handlers
├── services/                Business logic, all Prisma queries live here
├── validators/              zod schemas used by the validate() middleware
├── middleware/
│   ├── authenticate.js       Verifies the access token, attaches req.user
│   ├── authorize.js          RBAC: authorize("ADMIN", "MANAGER")
│   └── validate.js           Generic zod-schema request validator
├── utils/
│   ├── jwt.js                 Token generation/verification + hashToken()
│   ├── bcrypt.js               Password hashing
│   ├── email.js                 Nodemailer wrapper (logs to console if no SMTP configured)
│   └── ApiError.js              Error class carrying an HTTP status code
└── prisma/client.js           Shared PrismaClient instance
```

Every route follows the same chain:

```
authenticate  →  authorize(...roles)  →  validate(schema)  →  controller  →  service
   (optional)        (optional)            (optional)
```

## API map

| Method | Route | Auth | Roles |
|---|---|---|---|
| POST | `/api/auth/register` | – | – |
| POST | `/api/auth/login` | – | – |
| POST | `/api/auth/logout` | ✅ | any |
| POST | `/api/auth/refresh-token` | – | – |
| GET | `/api/auth/me` | ✅ | any |
| POST | `/api/auth/forgot-password` | – | – |
| POST | `/api/auth/reset-password/:token` | – | – |
| GET | `/api/auth/verify-email/:token` | – | – |
| GET / PATCH | `/api/companies/me` | ✅ | any (GET) / ADMIN (PATCH) |
| GET / POST | `/api/teams` | ✅ | any (GET) / ADMIN, MANAGER (POST) |
| GET / PATCH / DELETE | `/api/teams/:id` | ✅ | any (GET) / ADMIN, MANAGER (PATCH) / ADMIN (DELETE) |
| GET | `/api/users` | ✅ | ADMIN, MANAGER |
| PATCH | `/api/users/:id/role` | ✅ | ADMIN |
| PATCH | `/api/users/:id/team` | ✅ | ADMIN, MANAGER |
| PATCH | `/api/users/:id/status` | ✅ | ADMIN |
| POST / GET | `/api/invitations` | ✅ | ADMIN, MANAGER |
| GET | `/api/invitations/:token` | – | – (public, for the accept-invite page) |
| POST | `/api/invitations/:token/accept` | – | – (public) |
| DELETE | `/api/invitations/:id` | ✅ | ADMIN, MANAGER |

Full request/response schemas: `/api-docs`.

## Multi-tenancy

Every table below `Company` carries a `companyId`. Every service function
that reads or writes them takes `companyId` as an explicit parameter, sourced
from `req.user.companyId` (never from the request body/params) — so a user
can never act outside their own company by manipulating an id in the URL.

## RBAC

Three roles: `ADMIN`, `MANAGER`, `REP`. Enforcement is centralized in
`middleware/authorize.js`; nothing checks `req.user.role` inline anywhere
else. To add a new protected route:

```js
router.post(
  "/widgets",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(createWidgetSchema),
  widgetController.create
);
```

## Refresh tokens

See [`docs/REFRESH_TOKENS.md`](./docs/REFRESH_TOKENS.md) for the full design
(hashing, token families, rotation, reuse detection).

## Testing

```bash
cp .env.example .env.test   # point at a disposable test database — required
npm test
```

- `tests/unit/` — pure logic, no database (jwt hashing, bcrypt, the
  `authorize` middleware). These run anywhere, no setup needed.
- `tests/integration/` — full HTTP requests via Supertest against the real
  Express app and a real Postgres database:
  - `auth.flow.test.js` — register → me → login → refresh rotation → reuse
    detection → logout
  - `auth.backfill.test.js` — email verification, forgot/reset password
  - `organization.test.js` — Company/Team/User/Invitation APIs, including
    RBAC 403s and cross-tenant isolation checks

Integration tests create and delete their own rows (unique emails per run,
cleaned up in `afterAll`), but **use a disposable database** — don't point
`.env.test` at anything you care about.

## Seeding

`npm run seed` creates one Company, one Team, and one user per role:

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@pulsecrm.dev | value of `SEED_PASSWORD` (default `ChangeMe123!`) |
| MANAGER | manager@pulsecrm.dev | same |
| REP | rep@pulsecrm.dev | same |

Safe to re-run — it upserts by email/fixed id, so it won't duplicate data.
