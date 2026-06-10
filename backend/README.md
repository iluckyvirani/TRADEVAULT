# tradeox API (backend)

Node.js + Express + **Prisma** + **Neon PostgreSQL** — separate from the React frontend in the repo root.

## Layout

```
backend/
├── docs/BACKEND_DEVELOPMENT.md   # Full API spec, market data, frontend mapping
├── prisma/schema.prisma          # Database schema
├── src/                          # API source (to be added)
├── package.json
└── .env.example
```

Frontend lives at repo root: `../src/`

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit DATABASE_URL with your Neon connection string

npm run db:generate
npm run db:migrate
```

## Docs

See [docs/BACKEND_DEVELOPMENT.md](./docs/BACKEND_DEVELOPMENT.md) for routes, auth flow, referral design, WebSocket quotes, and NSE/BSE data vendors.
