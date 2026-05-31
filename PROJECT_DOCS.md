# tradeox — Paper Trading Platform
## Project Documentation v1.0 | May 2026

> **Stack Note:** This project uses **Neon PostgreSQL** (not Supabase).  
> **Build Strategy:** Frontend-first with dummy/mock data → Backend in Node.js + Express + Neon PostgreSQL after frontend is complete.

> **Evaluation flow (Market Rush model):** Post-login navigation, **auth/onboarding**, accounts dashboard, stats, and trading room are specified in **[MARKET_RUSH_FLOW_SPEC.md](./MARKET_RUSH_FLOW_SPEC.md)** v1.2. That document supersedes §5–§6 and §9 of this file for in-app UX. Landing page and backend plans remain here.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Build Strategy](#3-build-strategy)
4. [Landing Page](#4-landing-page)
5. [Authentication Flow](#5-authentication-flow)
6. [App Shell & Navigation](#6-app-shell--navigation)
7. [Dashboard Design](#7-dashboard-design)
8. [Trading Functionality](#8-trading-functionality)
9. [Additional Pages](#9-additional-pages)
10. [File Structure](#10-file-structure)
11. [Phase-by-Phase Build Plan](#11-phase-by-phase-build-plan)
12. [Competitive Analysis](#12-competitive-analysis)
13. [Key Dependencies](#13-key-dependencies)

---

## 1. Project Overview

### What is tradeox?
tradeox is a zero-risk, real-data **paper trading web application** built with React + Vite. It mirrors the full workflow of a professional brokerage platform — live market quotes, portfolio analytics, watchlists, order management, and P&L reporting — while executing all trades in a virtual, simulated environment. No real money is ever at risk.

**Target audiences:**
- Beginners learning market mechanics
- Intermediate traders stress-testing strategies
- Educators needing a classroom-safe environment

### Core Platform Philosophy

| Principle | Description | Implementation |
|---|---|---|
| Real Data, Fake Money | Live market prices via public APIs | Yahoo Finance / Polygon.io / Alpaca |
| Zero-Risk Learning | Virtual portfolio, no real execution | In-memory order book simulation |
| Professional UX | Same feel as Robinhood / Zerodha | Dark-mode first, chart-heavy UI |
| Performance | Sub-200 ms UI interactions | React Query + Vite code-splitting |
| Mobile-Ready | Responsive down to 375 px | TailwindCSS breakpoints |

---

## 2. Tech Stack

### Frontend (Current Focus)

| Layer | Technology | Purpose |
|---|---|---|
| Framework | React 18 + Vite 5 | SPA with HMR dev server |
| Language | TypeScript 5 | Type-safe codebase |
| Styling | TailwindCSS 3 + shadcn/ui | Utility-first + accessible components |
| Charts | TradingView Lightweight Charts | Candlestick, line, volume charts |
| State Management | Zustand + React Query | Global store + server cache |
| Routing | React Router v6 | File-system-style routes |
| Icons | Lucide React | Icon library |
| Dummy Data | Static JSON / mock modules | All data mocked during frontend phase |

### Backend (Planned — After Frontend Complete)

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js + Express.js | REST API server |
| Language | TypeScript | Type-safe backend |
| Database | **Neon PostgreSQL** | Portfolio, orders, watchlists, users |
| Auth | Custom JWT (jsonwebtoken) | Email/password auth, access + refresh tokens |
| Market Data | Polygon.io WebSocket + REST | Real-time quotes & OHLCV |
| Deployment | Vercel (frontend) + Railway/Render (backend) | Edge CDN + API hosting |

> **Why Neon?** Neon is a serverless PostgreSQL with branching, auto-suspend, and a generous free tier. It is accessed directly from the Express backend via `pg` or `drizzle-orm` — no vendor lock-in, pure SQL.

---

## 3. Build Strategy

### Phase Overview

```
Phase 1–7  →  Frontend only (React + Vite)
             All data is DUMMY / MOCKED (static JSON, faker.js, or hardcoded arrays)
             No real API calls, no real database

Phase 8+   →  Backend (Node.js + Express + Neon PostgreSQL)
             Replace dummy data layer with real API calls
             Implement JWT auth, real order engine, real portfolio persistence
```

### Dummy Data Layer (Frontend Phase)
During the frontend phase every data source is replaced with a mock module:

| Real Data Source | Frontend Mock |
|---|---|
| Neon PostgreSQL (users/portfolio) | Hardcoded `mockUser`, `mockPortfolio` objects |
| Neon PostgreSQL (orders) | `mockOrders` array in `src/lib/mock/` |
| Neon PostgreSQL (watchlists) | `mockWatchlists` array |
| Polygon.io WebSocket (live quotes) | Static price objects with random ±% per tick interval |
| Polygon.io REST (OHLCV) | Pre-generated candle arrays |
| Auth JWT | `useMockAuth()` hook returning always-logged-in user |

All mocks live in `src/lib/mock/`. Swapping to real API calls later requires only changing the import source — component logic stays identical.

---

## 4. Landing Page

### Design Goals
The landing page communicates value in 3 seconds, builds trust, and routes visitors to signup. Follows the AIDA model (Attention → Interest → Desire → Action).

> **Design North Star:** Feels like Robinhood / Webull / Zerodha — dark, data-rich, confident, modern. First fold loads under 1.2 s on 4G.

### Page Sections

#### 4.1 Navigation Bar
| Property | Value |
|---|---|
| Height | 64 px, fixed, backdrop-blur glass morphism |
| Left | tradeox SVG logo + wordmark |
| Center | Markets • Features • Pricing • Blog (hidden on mobile) |
| Right | Log In (ghost button) + Start Free (accent filled button) |
| Scroll behavior | Transparent → solid dark on scroll (300 ms transition) |
| Mobile | Hamburger → full-screen drawer |

#### 4.2 Hero Section
| Element | Spec |
|---|---|
| Background | Animated dark gradient `#0F172A → #1E1B4B` with stock-ticker particle system (canvas) |
| Headline | "Master the Market. Risk Nothing." — 64 px bold white |
| Sub-headline | "Trade stocks with $100,000 virtual cash. Real prices. Zero risk." — 20 px slate-400 |
| Primary CTA | "Start Trading Free" — indigo-500, 52 px tall, hover scale-105 |
| Secondary CTA | "Watch Demo" — ghost button with play icon |
| Trust badge | "No credit card required • Free forever • Real market data" |
| Hero visual | Animated dashboard mockup (PNG/Lottie) floating right |
| Stats strip | 50,000+ traders • $2.4B virtual volume • 98% uptime |

#### 4.3 How It Works (3-Step)
| Step | Icon | Title | Body |
|---|---|---|---|
| 1 | Rocket | Sign Up Free | Create your account in 30 seconds |
| 2 | DollarSign | Get $100K Virtual Cash | Portfolio loaded instantly |
| 3 | TrendingUp | Trade Like a Pro | Place orders, track P&L in real-time |

#### 4.4 Features Section
| Feature | Icon | Description |
|---|---|---|
| Real-Time Charts | CandlestickChart | TradingView charts with 50+ indicators |
| Live Market Quotes | Activity | Streaming prices via Polygon.io WebSocket |
| Order Types | ShoppingCart | Market, Limit, Stop-Loss, Trailing Stop |
| Portfolio Analytics | PieChart | Sector allocation, beta, Sharpe ratio |
| Watchlists | Bookmark | Custom watchlists with price alerts |
| Trade Journal | BookOpen | Auto-log every trade with notes and tags |
| Leaderboard | Trophy | Compete with other paper traders globally |
| Risk Simulator | Shield | What-if scenarios and VaR estimation |

#### 4.5 Pricing Section (Freemium)
| Feature | Free | Pro ($9/month) |
|---|---|---|
| Virtual portfolio | $100,000 | $1,000,000 |
| Watchlists | 3 | Unlimited |
| Chart indicators | 10 | 50+ |
| Trade history | 30 days | Unlimited |
| Options paper trading | No | Yes |
| Crypto pairs | 5 | 500+ |
| AI strategy assistant | No | Yes |
| Export to CSV/PDF | No | Yes |

#### 4.6 Footer
| Column | Content |
|---|---|
| Col 1 | Logo + tagline + social icons (Twitter, GitHub, LinkedIn, Discord) |
| Col 2 | Product: Features, Pricing, Changelog, Roadmap |
| Col 3 | Company: About, Blog, Careers, Press |
| Col 4 | Legal: Privacy Policy, Terms, Cookie Settings |
| Bottom bar | © 2026 tradeox Inc. • Not financial advice. • Paper trading only. |

---

## 5. Authentication Flow

> **Frontend Phase:** `useMockAuth()` hook returns a hardcoded logged-in user. No real auth.  
> **Backend Phase:** Custom JWT via Express. `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh` endpoints. Tokens stored in httpOnly cookies.

### Sign-Up Page

| Field | Validation |
|---|---|
| Full Name | 2–60 chars, letters/spaces only |
| Email | RFC 5322 regex |
| Password | Min 8 chars, 1 uppercase, 1 number — strength meter shown |
| Confirm Password | Must match password |
| Terms checkbox | Required |

**Post-Signup Flow (Backend Phase):**  
Register → Email verification → `/onboarding` (choose display name, avatar, starting balance: $10K / $50K / $100K)

### Login Page

| Element | Behavior |
|---|---|
| Email + Password | Standard form, autofill-friendly |
| Remember Me | 7-day refresh token stored in httpOnly cookie |
| Forgot Password | Modal → reset email → `/reset-password?token=...` |
| Failed attempts | 3 failures → 30-second cooldown + hCaptcha |

### Onboarding Wizard (3 Steps)
1. **Profile** — Display name, avatar picker (8 presets), preferred currency
2. **Portfolio Setup** — Starting balance ($10K / $50K / $100K / Custom), trading style, experience level
3. **Watchlist Seed** — Pick 5+ symbols from popular list to auto-populate dashboard

---

## 6. App Shell & Navigation

### Shell Layout

| Region | Size | Content |
|---|---|---|
| Top Navbar | 100% × 56 px | Logo, global search, market status, notifications, avatar menu |
| Left Sidebar | 240 px (collapsible to 64 px) | Navigation links |
| Main Content | Remaining width | Routed page content |
| Bottom Ticker Strip | 100% × 32 px | Scrolling live prices (watchlist + major indices) |

### Sidebar Navigation

| Section | Links | Icon |
|---|---|---|
| Main | Dashboard, Markets, Screener | LayoutDashboard, Globe, Filter |
| Trading | Portfolio, Orders, Trade History, Watchlists | Briefcase, Receipt, Clock, Star |
| Analytics | P&L Report, Risk Analysis, Trade Journal | BarChart2, Shield, BookOpen |
| Social | Leaderboard, Community, Challenges | Trophy, Users, Zap |
| Account | Settings, Subscription, Help | Settings, CreditCard, HelpCircle |

**Responsive behavior:**
- `< 1024 px` → icon-only sidebar
- `< 768 px` → hidden, accessible via hamburger
- Active route → indigo left-border + indigo text

### Top Navbar Elements

| Element | Description |
|---|---|
| Search (Cmd+K) | Global command palette — fuzzy search for symbols, pages, docs |
| Market Status Pill | Green dot "Market Open" / Red dot "Market Closed" + time-to-open |
| Notifications Bell | Badge with unread count — price alerts, order fills, system notices |
| Portfolio Value | Live virtual portfolio value (updates every 5 s during market hours) |
| Avatar Menu | Profile, Subscription, Dark/Light Toggle, Log Out |

### Page Routes

| Route | Page | Purpose |
|---|---|---|
| `/dashboard` | Dashboard | Primary hub — charts, portfolio snapshot, news, watchlist |
| `/markets` | Markets | Browse all tradable symbols |
| `/screener` | Screener | Filter stocks by technical/fundamental criteria |
| `/portfolio` | Portfolio | Holdings, allocation, open positions |
| `/orders` | Orders | Active, pending, and order history |
| `/trade-history` | Trade History | Closed trades with P&L per trade |
| `/watchlists` | Watchlists | Manage multiple watchlists |
| `/pnl` | P&L Report | Realized + unrealized gains charts |
| `/risk` | Risk Analysis | Beta, VaR, Sharpe, drawdown |
| `/journal` | Trade Journal | Annotated trade log with notes |
| `/leaderboard` | Leaderboard | Global + weekly rankings |
| `/settings` | Settings | Profile, notifications, API keys, data export |

---

## 7. Dashboard Design

### Layout
12-column CSS Grid "bento box" card system. Cards are draggable/resizable widgets with layout saved to `localStorage`.

> **Design Reference:** Robinhood Web (clean cards), Webull (data density), Trading 212 (color coding), TradingView (chart quality). Dark theme default (`#0F172A` background, `#1E293B` cards).

### Dashboard Widgets

#### 7.1 Portfolio Summary Card (4 cols)
| Field | Display |
|---|---|
| Total Portfolio Value | Large `$XX,XXX.XX` + today's ±$ and % change |
| Buying Power | Available cash in green |
| Total Return | All-time return in $ and % |
| Day's P&L | Today's gain/loss (green/red) |
| Mini sparkline | 7-day portfolio value line chart |

#### 7.2 Main Chart Panel (8 cols, 2 rows)
| Feature | Spec |
|---|---|
| Chart types | Candlestick / Line / Bar / Area |
| Time frames | 1m / 5m / 15m / 1h / 4h / 1D / 1W / 1M |
| Indicators | MA(20/50/200), EMA, VWAP, Bollinger Bands, RSI, MACD, Volume |
| Drawing tools | Trend lines, horizontal levels, Fibonacci retracement, annotations |
| Full screen | ESC to exit |
| Data badge | "Polygon.io • Real-time" (or "Mock Data" in frontend phase) |

#### 7.3 Watchlist Card (4 cols, right)
| Column | Content |
|---|---|
| Symbol | Ticker bold |
| Price | Flashes green on up-tick, red on down-tick |
| Change | +/- $ and % for today |
| Sparkline | 5-day mini line chart |
| Action | Quick Buy / Quick Sell on row hover |

#### 7.4 Order Entry Panel (right, below watchlist)
| Field | Options |
|---|---|
| Symbol | Auto-populated from watchlist or chart |
| Order side | Buy / Sell toggle (green/red) |
| Order type | Market / Limit / Stop / Stop-Limit / Trailing Stop |
| Quantity | Shares OR dollar amount toggle |
| Time in Force | Day / GTC / IOC / FOK |
| Estimated cost | Auto-calculated (commission = $0) |
| Submit | Confirm modal before placing |

#### 7.5 Portfolio Holdings Mini Table (6 cols, bottom-left)
Symbol • Shares • Avg Cost • Current Price • Market Value • P&L (color-coded) • Weight %

#### 7.6 Market Overview Card (6 cols, bottom-center)
- **Indices:** S&P 500, NASDAQ, DOW, Russell 2000, VIX
- **Sector heatmap:** 11 GICS sectors (green = up, red = down)
- **Crypto strip:** BTC, ETH, SOL, ADA
- **FX pairs:** USD/INR, EUR/USD, GBP/USD, USD/JPY

#### 7.7 Recent Trades Card (4 cols, bottom-right)
Time • Symbol • BUY/SELL • Qty • Price • P&L

#### 7.8 News Feed Card (full-width, optional)
- Filtered to watchlist symbols
- Source logo + headline + symbol tags + relative timestamp
- Click opens article in side drawer
- Sentiment badge: Bullish / Bearish / Neutral

---

## 8. Trading Functionality

### 8.1 Order Types

| Order Type | Logic | Fill Condition |
|---|---|---|
| Market | Execute immediately at current bid/ask | Always fills at next available tick |
| Limit Buy | Execute at or below limit price | Fills when ask ≤ limit price |
| Limit Sell | Execute at or above limit price | Fills when bid ≥ limit price |
| Stop Loss | Market order triggered at stop price | Converts to market when price ≤ stop |
| Stop-Limit | Limit order triggered at stop price | Converts to limit when stop triggered |
| Trailing Stop | Stop trails by fixed $ or % | Recalculates stop on each new high |

### 8.2 Order Lifecycle States

| State | Description | UI Color |
|---|---|---|
| PENDING | Created, awaiting validation | Gray |
| OPEN | Resting in order book | Amber |
| PARTIALLY_FILLED | Some shares filled | Blue |
| FILLED | Fully executed | Green |
| CANCELLED | Cancelled by user or expired (Day order) | Red |
| REJECTED | Insufficient buying power / invalid params | Dark Red |

### 8.3 Portfolio Calculation Formulas

| Metric | Formula |
|---|---|
| Position P&L | `(Current Price - Avg Cost) × Shares` |
| Portfolio Return % | `(Total Value - Starting Capital) / Starting Capital × 100` |
| Day P&L | `Σ (Current Price - Prev Close) × Shares` |
| Realized P&L | `Σ (Sell Price - Avg Cost) × Shares` for closed trades |
| Unrealized P&L | `Σ (Current Price - Avg Cost) × Shares` for open positions |
| Sharpe Ratio | `(Mean Daily Return - Risk-Free Rate) / StdDev × √252` |
| Max Drawdown | `Max (Peak - Trough) / Peak` in rolling window |
| Win Rate | `# Winning Trades / Total Closed × 100` |

### 8.4 Real-Time Data Architecture (Production)

| Layer | Technology | Update Frequency |
|---|---|---|
| WebSocket | Polygon.io Stocks WS | Per-tick during market hours |
| Quote normalizer | Custom transformer hook | Every tick |
| UI subscription | Zustand `subscribe()` | Throttled 1 update/500 ms per symbol |
| Stale fallback | React Query refetch | On WebSocket disconnect |
| Historical OHLCV | Polygon.io REST | On-demand per chart load |

> **Frontend Phase substitute:** A `useMockQuotes()` hook emits fake price ticks every 1 second using `setInterval`, simulating WebSocket behavior without any real connection.

---

## 9. Additional Pages

### 9.1 Markets Page (`/markets`)
- Tabs: Stocks | ETFs | Crypto | Forex | Futures
- Sortable table: Symbol, Name, Price, Change%, Volume, Market Cap, P/E
- Sector filter chips
- Quick-chart sparkline on row hover
- Click → side drawer with mini chart + stats + news

### 9.2 Stock Screener (`/screener`)
| Filter Category | Filters |
|---|---|
| Price | Price, Price Change %, 52W High/Low % |
| Volume | Volume, Relative Volume, Average Volume |
| Fundamentals | P/E, EPS, Revenue Growth, Dividend Yield, Market Cap |
| Technical | RSI, MACD Signal, Above/Below MA(20/50/200), ATR |
| Float & Short | Float, Short Interest %, Days to Cover |

### 9.3 Portfolio Page (`/portfolio`)
- Donut chart: sector allocation + asset class split
- Holdings table with full detail columns
- Performance chart: portfolio vs S&P 500 benchmark
- Risk metrics: Beta, Volatility, Sharpe, Max Drawdown, Correlation
- Dividend tracker

### 9.4 Trade Journal (`/journal`)
- Auto-logged trades with timestamp, price, qty, P&L
- User can add: Tags, Notes (rich text), Screenshot, Star rating (1–5)
- Filters: date, symbol, tag, rating
- Analytics: avg return by tag, win rate by strategy, trade frequency heat-map

### 9.5 Leaderboard (`/leaderboard`)
| Tab | Criteria |
|---|---|
| All-Time | Highest total % portfolio return since creation |
| This Week | Best % return in rolling 7-day window |
| This Month | Best % return in current calendar month |
| Challenges | Specific challenge scoreboards |

Row: Rank • Avatar • Username • Return % • Portfolio Value • Win Rate • Badges

---

## 10. File Structure

```
paper-trading/
├── public/
├── src/
│   ├── main.tsx                   # App entry point, providers setup
│   ├── App.tsx                    # Router tree, auth guard
│   ├── components/
│   │   ├── ui/                    # shadcn/ui + custom primitives (Button, Card, Modal…)
│   │   └── layout/                # AppShell, Sidebar, Topbar, TickerStrip
│   ├── features/
│   │   ├── auth/                  # Login, Signup, Onboarding pages + hooks
│   │   ├── dashboard/             # Dashboard page + all widget components
│   │   ├── trading/               # OrderEntry, OrderBook, TradeHistory
│   │   ├── markets/               # MarketsTable, SymbolDrawer, Screener
│   │   ├── portfolio/             # Holdings, Allocation, Performance, Risk
│   │   ├── charts/                # ChartPanel, ChartToolbar, IndicatorManager
│   │   └── journal/               # JournalTable, TradeNote, AnalyticsPanel
│   ├── hooks/
│   │   ├── useWebSocket.ts        # (production) Polygon.io WS hook
│   │   ├── useQuotes.ts           # Quote subscription hook
│   │   ├── usePortfolio.ts
│   │   └── useOrders.ts
│   ├── lib/
│   │   ├── mock/                  # ← ALL DUMMY DATA lives here (frontend phase)
│   │   │   ├── mockUser.ts
│   │   │   ├── mockPortfolio.ts
│   │   │   ├── mockOrders.ts
│   │   │   ├── mockWatchlists.ts
│   │   │   ├── mockQuotes.ts
│   │   │   └── mockCandles.ts
│   │   ├── api/                   # API client (wired to Express backend later)
│   │   ├── calculations.ts        # Portfolio math (P&L, Sharpe, drawdown…)
│   │   └── constants.ts
│   ├── store/
│   │   ├── portfolioStore.ts      # Zustand store
│   │   ├── ordersStore.ts
│   │   └── watchlistStore.ts
│   ├── types/
│   │   └── index.ts               # Order, Position, Quote, User interfaces
│   └── styles/
│       ├── globals.css
│       └── tailwind.config.ts
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── PROJECT_DOCS.md
```

### Backend Structure (Created Later)
```
backend/                           # Separate repo or monorepo package
├── src/
│   ├── index.ts                   # Express app entry
│   ├── routes/
│   │   ├── auth.ts                # POST /api/auth/register, /login, /refresh
│   │   ├── portfolio.ts           # GET/POST /api/portfolio
│   │   ├── orders.ts              # GET/POST/DELETE /api/orders
│   │   └── watchlists.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts      # JWT verify middleware
│   │   └── errorHandler.ts
│   ├── db/
│   │   ├── neon.ts                # Neon PostgreSQL connection (pg / drizzle-orm)
│   │   ├── schema.ts              # Table definitions
│   │   └── migrations/
│   └── services/
│       ├── orderEngine.ts         # Order simulation logic
│       └── portfolioCalculator.ts
├── .env                           # DATABASE_URL (Neon connection string), JWT_SECRET
└── package.json
```

---

## 11. Phase-by-Phase Build Plan

### Phase 1 — Project Bootstrap ✅ (Done)
- [x] Scaffold `paper-trading` with `create-vite` → React + TypeScript template
- [x] Install dependencies: `tailwindcss`, `shadcn/ui`, `react-router-dom`, `zustand`, `@tanstack/react-query`, `lightweight-charts`, `lucide-react`
- [x] Configure Tailwind with custom dark-mode colors (`class` strategy) + shadcn CSS variables
- [x] Configure path aliases in `vite.config.ts` and `tsconfig.json`
- [x] Create `src/lib/mock/` folder with all initial dummy data files
- [x] Create `src/lib/utils.ts` (`cn` helper for shadcn/ui)
- [x] Create `components.json` for shadcn/ui registry configuration

### Phase 2 — Landing Page (Week 2)
- [ ] `Navbar` component with scroll-aware glass morphism styling
- [x] `HeroSection` with animated gradient + CTA buttons + mock dashboard card
- [x] `HowItWorks` 3-step cards
- [x] `FeaturesGrid` with Lucide icons (8 features)
- [x] `PricingSection` two-tier comparison table (Free vs Pro)
- [ ] `TestimonialsRow`
- [x] `Footer` — 4-column grid with social icons
- [x] Wire Signup/Login CTAs → `/signup`, `/login` routes
- [x] Scroll-aware `Navbar` with glass morphism + mobile drawer

### Phase 3 — Auth UI & Onboarding (Week 3)
> All auth is **UI-only / mock** in this phase. No real API calls.
- [ ] `SignupPage` (form validation with zod, mock submit)
- [ ] `LoginPage` (mock login → sets `useMockAuth` state)
- [ ] `OnboardingWizard` 3-step form
- [ ] `AuthGuard` HOC to protect dashboard routes (reads mock auth state)

### Phase 4 — App Shell (Week 4)
- [ ] `AppShell` layout with `Sidebar` + `Topbar` + `TickerStrip`
- [ ] Sidebar collapse + mobile drawer
- [ ] Global `CommandPalette` (Cmd+K) with symbol search
- [ ] React Router v6 nested routes within shell

### Phase 5 — Dashboard & Charts (Weeks 5–6)
- [ ] `ChartPanel` using TradingView Lightweight Charts (fed by `mockCandles`)
- [ ] Chart type switcher and time-frame tabs
- [ ] Indicators panel (MA, EMA, RSI, MACD, Volume)
- [ ] `WatchlistCard` with mock price tick simulation
- [ ] `OrderEntryPanel` with all order types (stores to `ordersStore`)
- [ ] `PortfolioSummaryCard` and `MarketOverviewCard` from mock data
- [ ] Wire all cards to Zustand stores

### Phase 6 — Trading Engine (Week 7)
- [ ] Order simulation engine (market fill logic, client-side)
- [ ] Limit/stop order queue (check on every mock price tick)
- [ ] Portfolio calculation service (P&L, cost basis) in `calculations.ts`
- [ ] Order lifecycle state machine
- [ ] Order confirmation modals with risk warning

### Phase 7 — Analytics & Social UI (Weeks 8–9)
- [ ] Full `Portfolio` page with allocation donut chart (recharts)
- [ ] `P&L Report` page with area chart
- [ ] `Risk Analysis` page (Sharpe, drawdown, beta — calculated from mock history)
- [ ] `Trade Journal` with CRUD (stored in Zustand + localStorage in frontend phase)
- [ ] `Leaderboard` with mock rankings

### Phase 8 — Polish & Frontend QA (Week 10)
- [ ] Responsive QA on mobile (375 px), tablet (768 px), desktop
- [ ] Loading skeletons for all async components
- [ ] Error boundaries
- [ ] Lighthouse audit: target > 90 Performance, 100 Accessibility
- [ ] E2E tests with Playwright (signup → first trade → portfolio check)

### Phase 9 — Backend: Node.js + Express + Neon PostgreSQL
> **Start here only after frontend is complete and signed off.**
- [ ] Initialize Express + TypeScript backend project
- [ ] Connect to **Neon PostgreSQL** via `DATABASE_URL` connection string
- [ ] Create schema migrations (users, portfolios, orders, positions, watchlists, journal_entries)
- [ ] Implement JWT auth endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`)
- [ ] Implement portfolio, orders, watchlists REST endpoints
- [ ] Replace `src/lib/mock/*` imports with real `src/lib/api/*` calls
- [ ] Move order simulation engine to backend
- [ ] Deploy backend to Railway / Render; connect to Neon

### Phase 10 — Real Market Data Integration
- [ ] Integrate Polygon.io WebSocket for live quote streaming
- [ ] Replace `useMockQuotes` with real `useWebSocket` hook
- [ ] Historical OHLCV from Polygon.io REST API
- [ ] News feed from Polygon.io `/v2/reference/news`

---

## 12. Competitive Analysis

| App | Strengths | Weaknesses | tradeox Advantage |
|---|---|---|---|
| Robinhood | Beautiful UX | No paper trading, US-only | Risk-free + global access |
| Webull | Paper trading, advanced charts | Cluttered UI, complex onboarding | Cleaner UI, faster onboarding |
| TradingView | Best charting | No portfolio management, paid | Full portfolio + charting, free tier |
| Investopedia Sim | Education-focused | Outdated UI, 15-min delay | Modern UI, near-real-time data |
| Thinkorswim | Institutional-grade tools | Desktop-only, steep learning curve | Web-first, beginner-friendly |

### UX Patterns Adopted
| Pattern | Inspired By | Implementation |
|---|---|---|
| Bottom order ticket on mobile | Robinhood | Fixed bottom drawer on < 768 px |
| Green/red flash on price tick | Bloomberg Terminal | CSS keyframe flash animation |
| Bento box dashboard | Groww, Smallcase | CSS Grid draggable widget system |
| Candlestick chart quality | TradingView | Lightweight Charts library |
| Dark theme default | Webull, Binance | Tailwind dark class strategy |
| Cmd+K command palette | Linear, Vercel | `cmdk` library integration |
| Trade journal with tags | Tradervue, Edgewonk | Custom CRUD with rich text |
| Sector heatmap | Finviz | D3-powered SVG treemap |

### Compliance Notes
> tradeox is a paper trading simulation. All trades are virtual. No real securities transactions occur.  
> Required disclaimer on: footer, every order confirmation, onboarding.  
> Pro subscription via Stripe (no financial instrument handling).  
> GDPR: data deletion on account closure.

---

## 13. Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | ^18.3 | UI framework |
| `vite` | ^5.4 | Build tool + dev server |
| `typescript` | ^5.5 | Type safety |
| `tailwindcss` | ^3.4 | Utility CSS |
| `@shadcn/ui` | latest | Accessible UI components |
| `react-router-dom` | ^6.26 | Client-side routing |
| `@tanstack/react-query` | ^5.56 | Server state management |
| `zustand` | ^4.5 | Global client state |
| `lightweight-charts` | ^4.2 | TradingView charts |
| `lucide-react` | ^0.451 | Icon library |
| `recharts` | ^2.12 | Analytics charts |
| `cmdk` | ^1.0 | Command palette |
| `date-fns` | ^3.6 | Date utilities |
| `zod` | ^3.23 | Schema validation |
| `@faker-js/faker` | ^8.x | Dummy data generation (frontend phase) |

**Backend dependencies (Phase 9+):**

| Package | Purpose |
|---|---|
| `express` | HTTP server |
| `pg` or `drizzle-orm` | Neon PostgreSQL client |
| `jsonwebtoken` | JWT sign/verify |
| `bcryptjs` | Password hashing |
| `zod` | Request validation |
| `cors` | CORS middleware |
| `dotenv` | Environment variables |

---

*© 2026 tradeox — Confidential. Not financial advice. All trading is simulated.*
