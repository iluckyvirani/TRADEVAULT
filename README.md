# tradeox

Prop-firm **evaluation platform** for Indian markets.

## Monorepo layout

| Path | Purpose |
|------|---------|
| **`src/`** | React + Vite **frontend** (auth wired to API; trading still mock) |
| **`backend/`** | Express API, **Prisma**, Neon PostgreSQL, backend docs |

## Quick start (full stack)

**Terminal 1 — API**

```bash
cd backend
npm install
cp .env.example .env
# Set DATABASE_URL (Neon or local Postgres)
npm run db:generate
npm run db:push
npm run dev
```

**Terminal 2 — frontend**

```bash
npm install
npm run dev
```

Vite proxies `/api` → `http://localhost:4000`. Auth pages call the real backend.

## Documentation

| Document | Location |
|----------|----------|
| Backend API, Prisma, market data | [backend/docs/BACKEND_DEVELOPMENT.md](./backend/docs/BACKEND_DEVELOPMENT.md) |
| Evaluation UX flow | [MARKET_RUSH_FLOW_SPEC.md](./MARKET_RUSH_FLOW_SPEC.md) |
| Original product spec | [PROJECT_DOCS.md](./PROJECT_DOCS.md) |

## Stack

**Frontend:** React 19, TypeScript, Vite 8, Tailwind, Zustand, lightweight-charts, recharts  

**Backend:** Express 5 + Prisma 6 + Neon PostgreSQL — auth APIs live in `backend/src/`
