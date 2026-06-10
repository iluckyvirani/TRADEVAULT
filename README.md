# tradeox

Prop-firm **evaluation platform** for Indian markets.

## Monorepo layout

| Path | Purpose |
|------|---------|
| **`src/`** | React + Vite **frontend** (mock data today) |
| **`backend/`** | Node API, **Prisma**, Neon PostgreSQL, backend docs |

## Quick start (frontend)

```bash
npm install
npm run dev
```

## Quick start (backend / database)

```bash
cd backend
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
```

## Documentation

| Document | Location |
|----------|----------|
| Backend API, Prisma, market data | [backend/docs/BACKEND_DEVELOPMENT.md](./backend/docs/BACKEND_DEVELOPMENT.md) |
| Evaluation UX flow | [MARKET_RUSH_FLOW_SPEC.md](./MARKET_RUSH_FLOW_SPEC.md) |
| Original product spec | [PROJECT_DOCS.md](./PROJECT_DOCS.md) |

## Stack

**Frontend:** React 19, TypeScript, Vite 8, Tailwind, Zustand, lightweight-charts, recharts  

**Backend (planned):** Express + Prisma 6 + Neon PostgreSQL — see `backend/`
