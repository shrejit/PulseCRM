# pulsecrm-frontend

React + Vite + Tailwind CSS frontend for PulseCRM.

## Setup

```bash
npm install
cp .env.example .env     # set VITE_API_URL to your backend's URL
npm run dev               # http://localhost:5173
```

## Stack

- React 19 + Vite + React Router
- Redux Toolkit for authentication state (`src/features/auth`)
- Tailwind CSS (design tokens in `tailwind.config.js` — see `pulsecrm-backend`'s
  sibling design system for the color/spacing/typography source of truth)
- `lucide-react` for icons

## Structure

```
src/
├── api/api.js              Axios instance (base URL, auth header injection)
├── features/auth/           authSlice — login/logout/loading state
├── hooks/useAuth.js          Convenience hook over the Redux auth state
├── store/store.js             Redux store setup
├── components/
│   ├── Navbar.jsx               Top bar (search, notifications, user menu)
│   ├── Sidebar.jsx               Left nav + logout
│   ├── Loader.jsx                Reusable loading spinner
│   └── ProtectedRoute.jsx         Redirects to /login if not authenticated
└── pages/
    ├── Login.jsx / Register.jsx
    ├── ForgotPassword.jsx / ResetPassword.jsx
    ├── VerifyEmail.jsx
    └── Dashboard.jsx
```

## Talking to the backend

`src/api/api.js` reads `VITE_API_URL` and attaches the stored access token
to every request. See `pulsecrm-backend/README.md` for the full API map —
every endpoint documented there (Company/Team/User/Invitation) is ready to
be wired into new pages; only Auth + Dashboard are built so far.

## Known gap

`Sidebar.jsx` currently links to `/contacts`, `/leads`, `/deals`, `/tasks`,
`/company`, and `/settings`, but only `/dashboard` is registered as a route
in `App.jsx` today. Those are the next pages to build, backed by the
already-implemented Company/Team/User/Invitation APIs.
