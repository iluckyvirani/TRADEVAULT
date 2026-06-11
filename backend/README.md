# tradeox API (backend)

Node.js + Express + **Prisma** + **Neon PostgreSQL** — separate from the React frontend in the repo root.

## Layout

```
backend/
├── docs/BACKEND_DEVELOPMENT.md   # Full API spec, market data, frontend mapping
├── prisma/schema.prisma          # Database schema
├── src/
│   ├── index.ts                  # Express app entry
│   ├── routes/auth.ts            # Auth API routes
│   └── services/authService.ts   # Auth business logic
├── package.json
└── .env.example
```

Frontend lives at repo root: `../src/`

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit DATABASE_URL with your Neon (or local Postgres) connection string

npm run db:generate
npm run db:push      # or: npm run db:migrate
npm run dev          # http://localhost:4000
```

In another terminal (repo root):

```bash
npm run dev          # Vite proxies /api → localhost:4000
```

## Auth API (implemented)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Service health |
| POST | `/api/auth/register` | `{ email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |
| POST | `/api/auth/refresh` | Refresh access token (httpOnly cookie) |
| POST | `/api/auth/logout` | Revoke refresh token |
| GET | `/api/auth/me` | Current user (Bearer token) |
| POST | `/api/auth/complete-profile` | Profile step after register |
| POST | `/api/auth/verify-email` | Verify email (dev: no token required) |
| POST | `/api/auth/resend-verification` | Resend verification email |

### Accounts API (Phase 2)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/accounts` | List user's evaluation accounts |
| POST | `/api/accounts/free-trial` | `{ accountSize }` |
| POST | `/api/accounts/paid` | `{ planId }` or `{ accountSize }` |
| PATCH | `/api/accounts/active` | `{ accountId }` |
| GET | `/api/accounts/:id` | Single account |
| GET | `/api/accounts/:id/stats` | Objectives progress summary |
| GET | `/api/accounts/:id/equity-curve` | Equity curve points |

## Docs

See [docs/BACKEND_DEVELOPMENT.md](./docs/BACKEND_DEVELOPMENT.md) for full routes, referral design, WebSocket quotes, and NSE/BSE data vendors.
