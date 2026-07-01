# PulseCRM — Enterprise Sales & CRM Platform
## 8-Week Full Stack Internship Roadmap (2 Interns)

**Project:** PulseCRM — a production-grade B2B Customer Relationship Management SaaS for sales teams to manage contacts, leads, deals, pipelines, tasks, and reporting.

**Team:** 2 Full Stack Interns (both work across frontend + backend every week, feature ownership rotates weekly — no frontend/backend split).

**Stack:** React + TypeScript + Vite + Tailwind + Redux Toolkit + React Query + Axios + RHF + Zod + Recharts | Node.js + Express + TypeScript | PostgreSQL + Prisma | JWT + RBAC | Jest + Supertest + Postman | Swagger + GitBook | Vercel + Render/Railway + Neon.

---

## Roadmap Overview

| Week | Sprint Theme | Core Outcome |
|---|---|---|
| **1** | Foundations & Planning | SRS, wireframes, DB schema, repo/project scaffold, dev environment live |
| **2** | Auth, RBAC & Org Setup | JWT auth, refresh tokens, email verification, forgot/reset password, Company/Team/User management, role-based access |
| **3** | Contacts & Leads Module | Full CRUD, search/filter/sort, CSV import/export, lead scoring fields, pagination |
| **4** | Deals & Pipeline Module | Kanban-style pipeline board, drag-and-drop stage transitions, deal value/currency tracking, deal history |
| **5** | Tasks, Activities & Calendar | Task assignment, due dates/reminders, activity/notes timeline per contact & deal, calendar view |
| **6** | Reporting, Analytics & Notifications | Recharts dashboards (sales funnel, win-rate, rep performance), in-app + email notifications |
| **7** | Hardening, Search & Performance | Global search, role-based dashboards, caching/query optimization, security audit, full test suite |
| **8** | Deployment, Docs & Handover | Production deployment (Vercel/Render/Neon), final QA, documentation, client demo, handover package |

---

## Weekly Focus Breakdown

### Week 1 — Foundations & Planning
Requirement gathering, SRS, user personas, user stories, product backlog, wireframe descriptions, ER diagram, folder structure, repo setup, CI-lint scaffold, initial Prisma schema, Swagger skeleton.

### Week 2 — Authentication, RBAC & Organization Setup
JWT + refresh token flow, email verification, forgot/reset password, RBAC (Admin / Sales Manager / Sales Rep), Company & Team entities, user invitation flow, protected route middleware, auth UI (login/register/forgot-password) in React.

### Week 3 — Contacts & Leads Module
Contact & Lead data models, CRUD APIs, list/detail UI with React Query, advanced filters, CSV import/export, lead status pipeline, ownership assignment, duplicate detection.

### Week 4 — Deals & Sales Pipeline
Deal entity linked to Contact, pipeline stages, Kanban board with drag-and-drop (stage change = API update), deal value/currency/probability fields, deal activity history, win/loss reasons.

### Week 5 — Tasks, Activities & Calendar
Task entity (assignee, due date, priority, linked to deal/contact), activity/notes timeline, calendar view of tasks & deal close dates, reminder notifications (in-app).

### Week 6 — Reporting, Analytics & Notifications
Recharts-based dashboards: sales funnel, pipeline value by stage, rep leaderboard, conversion rate over time. Notification center (in-app) + transactional email (deal won, task due, lead assigned).

### Week 7 — Hardening, Search & Performance
Global search (contacts/deals/tasks), role-based dashboard views, query/index optimization, rate limiting, input validation audit, Jest + Supertest coverage push, Postman regression collection.

### Week 8 — Deployment, Documentation & Client Handover
Production deploy (Vercel frontend, Render/Railway backend, Neon Postgres), environment configs, final bug bash, GitBook documentation completion, README, user/admin manuals, client demo, resume/LinkedIn write-ups, final handover checklist.

---

## Deliverables Produced Across 8 Weeks
Executive Summary • SRS • Product Backlog • Wireframes • System/Component/Deployment Architecture • ER Diagram • API Docs (Swagger) • GitBook (full) • README • Weekly Sprint Reports • Testing Report • Deployment Guide • User & Admin Manuals • Final Presentation (15–20 slides) • Evaluation Rubric (100 marks) • Resume & LinkedIn project descriptions • Interview Question bank • Client Handover Checklist

---

*Detailed Week 1 requirement document and GitBook onboarding/Week 1 content are provided separately.*
