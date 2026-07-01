# PulseCRM

**Enterprise Sales & Customer Relationship Management Platform**

PulseCRM is a production-grade B2B CRM SaaS built during an 8-week Full Stack Development internship. It replaces manual, spreadsheet-based sales tracking with a centralized platform for contact/lead management, visual sales pipelines, task tracking, and real-time analytics — with full role-based access control.

![Status](https://img.shields.io/badge/status-in--development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Migration](#database-migration)
- [Running the Backend](#running-the-backend)
- [Running the Frontend](#running-the-frontend)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Weekly Timeline](#weekly-timeline)
- [Deployment](#deployment)
- [Testing](#testing)
- [Future Improvements](#future-improvements)
- [Contributors](#contributors)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

PulseCRM enables sales teams to:
- Centralize and search customer contact and lead data
- Track deals through a visual, drag-and-drop sales pipeline
- Assign and manage tasks and follow-ups
- Log activity/notes per contact and deal
- View real-time dashboards on pipeline value, conversion rates, and rep performance
- Operate securely under role-based access (Admin / Sales Manager / Sales Rep)

Built as a multi-tenant-ready SaaS, scoped by Company, with production-style authentication, testing, and deployment pipelines.

---

## Features

- 🔐 JWT authentication with refresh tokens, email verification, forgot/reset password
- 👥 Role-Based Access Control — Admin / Sales Manager / Sales Rep
- 📇 Contact & Lead management — CRUD, search, filter, CSV import/export, duplicate detection
- 📊 Visual sales pipeline — Kanban board with drag-and-drop stage transitions
- ✅ Task & activity management — assignment, due dates, reminders, notes timeline
- 📅 Calendar view for tasks and deal close dates
- 📈 Analytics dashboards — sales funnel, conversion rate, rep leaderboard (Recharts)
- 🔔 In-app + email notifications
- 🔍 Global search across contacts, deals, and tasks
- 📄 Full Swagger/OpenAPI documentation
- 🧪 Automated test suite (Jest + Supertest)

*(25–40 full enterprise feature list maintained in `/docs/features.md`)*

---

## Tech Stack

**Frontend:** React · TypeScript · Vite · Tailwind CSS · React Router · Redux Toolkit · React Query · Axios · React Hook Form · Zod · Recharts

**Backend:** Node.js · Express.js · TypeScript

**Database:** PostgreSQL · Prisma ORM · Neon (hosting)

**Auth & Security:** JWT · Refresh Tokens · RBAC · Email Verification · Forgot/Reset Password · Helmet · CORS

**Testing:** Jest · Supertest · Postman

**Documentation:** Swagger/OpenAPI · GitBook

**Deployment:** Vercel (frontend) · Render/Railway (backend) · Neon PostgreSQL (database)

---

## Architecture

```
┌─────────────┐        HTTPS/REST        ┌──────────────┐        Prisma        ┌──────────────┐
│   React SPA │  ───────────────────────▶ │  Express API  │ ───────────────────▶ │  PostgreSQL  │
│  (Vercel)   │ ◀─────────────────────── │  (Render/     │ ◀─────────────────── │   (Neon)     │
│             │      JSON responses       │   Railway)    │                       │              │
└─────────────┘                           └──────────────┘                       └──────────────┘
      │                                          │
      ▼                                          ▼
 Redux Toolkit                             JWT Middleware
 React Query cache                         RBAC Guards
```

- **Client:** SPA with Redux Toolkit for global/auth state, React Query for server-state caching
- **Server:** Layered architecture — `routes → controllers → services → Prisma`
- **Database:** Multi-tenant relational schema scoped by `Company`
- **Docs:** Swagger UI at `/api/docs`; narrative docs in GitBook

---

## Folder Structure

```
pulsecrm-backend/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── prisma/
│   ├── utils/
│   └── config/
├── tests/
├── swagger/
└── .env.example

pulsecrm-frontend/
├── src/
│   ├── features/
│   ├── components/
│   ├── pages/
│   ├── store/
│   ├── api/
│   ├── hooks/
│   └── types/
└── .env.example
```

---

## Installation

Clone both repositories:

```bash
git clone https://github.com/<org>/pulsecrm-backend.git
git clone https://github.com/<org>/pulsecrm-frontend.git
```

Install dependencies in each:

```bash
cd pulsecrm-backend && npm install
cd ../pulsecrm-frontend && npm install
```

---

## Environment Variables

**Backend (`pulsecrm-backend/.env`):**

```env
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@<neon-host>/<db>?sslmode=require
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your_email
EMAIL_SMTP_PASS=your_email_password
CLIENT_URL=http://localhost:5173
```

**Frontend (`pulsecrm-frontend/.env`):**

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Database Migration

```bash
cd pulsecrm-backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio   # optional: view DB in browser
```

---

## Running the Backend

```bash
cd pulsecrm-backend
npm run dev
# API available at http://localhost:5000
# Swagger docs at http://localhost:5000/api/docs
# Health check: GET http://localhost:5000/api/health
```

---

## Running the Frontend

```bash
cd pulsecrm-frontend
npm run dev
# App available at http://localhost:5173
```

---

## API Documentation

Interactive API documentation is auto-generated via Swagger/OpenAPI and available at:

```
http://localhost:5000/api/docs        (local)
https://<backend-url>/api/docs        (production)
```

A Postman collection is maintained at `pulsecrm-backend/postman/PulseCRM.postman_collection.json`.

---

## Screenshots

> _Screenshots to be added as each module is completed._

| Login | Dashboard | Pipeline Board |
|---|---|---|
| `screenshot-placeholder.png` | `screenshot-placeholder.png` | `screenshot-placeholder.png` |

---

## Weekly Timeline

| Week | Focus | Outcome |
|---|---|---|
| 1 | Foundations & Planning | SRS, ER diagram, scaffolding, GitBook live |
| 2 | Auth, RBAC & Org Setup | JWT auth, RBAC, Company/Team/User management |
| 3 | Contacts & Leads Module | Full CRUD, filters, CSV import/export |
| 4 | Deals & Sales Pipeline | Kanban pipeline board, drag-and-drop stages |
| 5 | Tasks, Activities & Calendar | Task management, activity timeline, calendar |
| 6 | Reporting, Analytics & Notifications | Recharts dashboards, notification system |
| 7 | Hardening, Search & Performance | Global search, security audit, full test suite |
| 8 | Deployment, Docs & Handover | Production deploy, full documentation, client demo |

Full sprint-by-sprint details are documented in GitBook.

---

## Deployment

| Component | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) |
| Backend API | [Render](https://render.com) / [Railway](https://railway.app) |
| Database | [Neon](https://neon.tech) (Serverless PostgreSQL) |

**Deploy steps (summary):**
1. Push `main` branch to trigger CI
2. Backend: set environment variables on Render/Railway, run `npx prisma migrate deploy` on release
3. Frontend: connect repo to Vercel, set `VITE_API_BASE_URL` to production API URL
4. Verify `/api/health` on production before promoting

Full step-by-step guide: `docs/deployment-guide.md` (GitBook).

---

## Testing

```bash
cd pulsecrm-backend
npm run test          # Jest unit tests
npm run test:api      # Supertest integration tests
```

Manual/regression testing via the Postman collection in `postman/`.

---

## Future Improvements

- Native mobile apps (iOS/Android)
- Third-party CRM data migration (e.g., Salesforce import)
- Billing & subscription management for multi-client SaaS use
- Multi-language (i18n) support
- AI-based lead scoring and deal-win prediction

---

## Contributors

| Name | Role |
|---|---|
| Intern 1 | Full Stack Developer |
| Intern 2 | Full Stack Developer |
| Mentor | Program Director / Technical Mentor |

---

## License

Distributed under the MIT License. See `LICENSE` for details.

---

## Acknowledgements

- Built as part of the Technocolabs Softwares Full Stack Development Internship Program
- Powered by React, Node.js, Prisma, and PostgreSQL
- Documentation hosted on GitBook
