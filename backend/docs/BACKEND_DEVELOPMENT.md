# tradeox — Backend Development & Market Data Guide

> **Version:** 2.0 · June 2026  
> **Audience:** Backend engineers, founders, DevOps  
> **Current state:** Frontend-only SPA (`../src/`). All trading data is mock + Zustand/localStorage. **API server not implemented yet** — this folder holds **Prisma schema**, docs, and future `src/` API code.

This document maps the **tradeox frontend** to the backend to build, including **dynamic charts and live prices** for Indian markets (NIFTY, BSE, F&O, MCX).

**Repo layout:**
```
TRADEVAULT/
├── src/                    # React frontend (Vite)
├── backend/
│   ├── docs/               # This file
│   ├── prisma/schema.prisma
│   ├── src/                # Express API (to be added)
│   └── package.json
├── MARKET_RUSH_FLOW_SPEC.md
└── PROJECT_DOCS.md
```

---

## Table of Contents

1. [Executive summary](#1-executive-summary)
2. [Current frontend (scanned)](#2-current-frontend-scanned)
3. [Target backend architecture](#3-target-backend-architecture)
4. [Database — Prisma + Neon](#4-database--prisma--neon)
5. [REST API specification](#5-rest-api-specification)
6. [WebSocket & real-time data](#6-websocket--real-time-data)
7. [Charts — current features & backend requirements](#7-charts--current-features--backend-requirements)
8. [Market data for India (NSE / BSE / MCX)](#8-market-data-for-india-nse--bse--mcx)
9. [API & subscription purchase guide](#9-api--subscription-purchase-guide)
10. [Order engine & evaluation logic](#10-order-engine--evaluation-logic)
11. [Payments, affiliate & billing](#11-payments-affiliate--billing)
12. [Environment variables](#12-environment-variables)
13. [Frontend integration plan](#13-frontend-integration-plan)
14. [Phased rollout](#14-phased-rollout)
15. [Compliance checklist](#15-compliance-checklist)

---

## 1. Executive summary

| Area | Today (mock) | Production target |
|------|----------------|-------------------|
| **Auth** | Zustand `tv-auth` | JWT + refresh tokens, email verification |
| **Accounts** | `evaluationAccountStore` | PostgreSQL + rule engine |
| **Orders / positions** | `evaluationTradingStore` | Server-side order book + fills |
| **Quotes** | `portfolioStore` + `useMockTicker` random walk | Licensed NSE/BSE/MCX feed via vendor API |
| **Candles / charts** | `mockCandles` (180 daily bars, 10 symbols) | Historical + intraday OHLCV API |
| **Instruments** | `mockInstruments` + `mockOptionChains` | Instrument master + option chain API |
| **Payments** | Client-only `billingStore` | Razorpay webhooks → DB |

**Critical decision for India:** You **cannot** legally show **real-time** NIFTY / BSE / NSE equity prices to paying users using free scrapers or US APIs (Polygon, Yahoo). You need an **NSE/BSE-authorised data vendor** license, or use **exchange-approved delayed data** (typically 15-minute delay) for lower cost. Budget separately for **vendor fees** and **exchange pass-through fees**.

---

## 2. Current frontend (scanned)

Last reviewed against `../src/` — June 2026.

### 2.1 Routes (`../src/App.tsx`)

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `LandingPage` | Public marketing |
| `/signup` | redirect | → `/auth?tab=create` (+ preserves `?ref=`) |
| `/login` | redirect | → `/auth?tab=signin` |
| `/auth` | `AuthPage` | Sign in / Create profile |
| `/auth/complete-profile` | `CompleteProfilePage` | Title, name, phone, **referral code**, help checkbox |
| `/auth/verify-email` | `VerifyEmailPage` | Demo verify → loading |
| `/auth/loading` | `AuthLoadingPage` | 1.5s → `/dashboard` |
| `/onboarding` | `OnboardingPage` | Legacy wizard (optional) |
| `/dashboard` | `AccountsDashboardPage` | Evaluation home |
| `/accounts` | `AccountsListPage` | Account manager / copier UI |
| `/accounts/:id/stats` | `AccountStatsPage` | Objectives, equity curve, journal |
| `/accounts/:id/trading-room` | `TradingRoomPage` | **No sidebar shell** |
| `/evaluation` | `EvaluationCheckoutPage` | Paid checkout |
| `/free-trial` | `FreeTrialPage` | Free trial account |
| `/profile` | `ProfilePage` | Tabs: Personal, **Refer & Earn**, Preferences, Verified |
| `/affiliate` | redirect | → `/profile?tab=referral` |
| `/billing` | `BillingPage` | Payment history |
| `/faq` | `FaqPage` | Searchable FAQ |
| `/contact` | `ContactPage` | Contact + feedback form |
| `/certificates`, `/rewards`, `/chatbot` | redirect | → `/dashboard` (not built yet) |
| `/trade`, `/portfolio`, … | redirect | Legacy broker → `/dashboard` |

### 2.2 Evaluation shell sidebar (`EvaluationSidebar.tsx`)

| Nav item | Path |
|----------|------|
| **Start Evaluation** (CTA) | `/evaluation` |
| Dashboard | `/dashboard` |
| Accounts | `/accounts` |
| Profile | `/profile` |
| Billing | `/billing` |
| FAQ | `/faq` |
| Contact | `/contact` |

No separate Affiliate, Certificates, Rewards, or Chatbot nav items.

### 2.3 Auth flow

```
/signup?ref=CODE → /auth?tab=create&ref=CODE
  → register(email)     registrationStep: registered
  → /auth/complete-profile
       fields: title, fullName, phone, affiliateCode (optional), onboardingHelp
       validates affiliate via affiliateStore.validateCode
       ref stored in checkoutStore.affiliateCode (NOT authStore)
  → completeProfile()   registrationStep: profile_completed
  → /auth/verify-email
  → verifyEmail()       registrationStep: email_verified
  → /auth/loading → /dashboard

Sign-in tab: signIn(email) → skips to email_verified → /auth/loading → /dashboard
```

**`registrationStep` values:** `registered` | `profile_completed` | `email_verified` | `evaluation_started`

`evaluation_started` is set by `markEvaluationStarted()` after free trial or paid checkout.

**Guards:** `AuthGuard`, `GuestGuard`, `RegistrationGuard` — `src/components/auth/AuthGuard.tsx`

### 2.4 Profile page tabs (`ProfilePage.tsx`)

| Tab | URL | Backend fields |
|-----|-----|----------------|
| Personal | default | `nickname`, read-only `title`, `name`, `email`, `phone` |
| Refer & Earn | `?tab=referral` | `ProfileReferralSection` — code, link, stats, referral rows |
| Preferences | — | `theme`, `onboardingHelp`, `commChannel` (whatsapp/sms/call) |
| Verified Trader | — | Informational eligibility copy |

### 2.5 Referral / affiliate design (current)

**No standalone `AffiliatePage`.** All referral UI is on Profile → Refer & Earn.

| Step | Where | What happens |
|------|-------|--------------|
| Share link | `ProfileReferralSection` | `/signup?ref={code}` |
| Enter code | `CompleteProfilePage` | Optional field; validates live |
| `?ref=` propagation | `/signup`, `/auth`, `/evaluation` | → `checkoutStore.affiliateCode` |
| Attribution | `EvaluationCheckoutPage` on pay | `recordReferralFromCheckout()` |
| Display | Profile referral tab | Pending + successful lists, ₹500 reward copy |

**Commission model:** flat **₹500** per successful referral (`REFERRAL_REWARD_AMOUNT` in `mockAffiliate.ts`). Demo code: `DEMO123`.

**Checkout sidebar** (`OrderSummarySidebar`) has **no** affiliate field — code is only on complete-profile + URL.

### 2.6 Zustand persist keys

| Key | Store | Persisted |
|-----|-------|-----------|
| `tv-auth` | authStore | user, registrationStep, onboardingComplete, lockout |
| `tv-evaluation-accounts` | evaluationAccountStore | all accounts |
| `tv-evaluation-trading` | evaluationTradingStore | orders, positions, basketSets, activeBasketByAccount, basketSizeMode |
| `tv-instruments` | instrumentStore | activeInstrumentId, **watchlists**, activeWatchlistId |
| `tv-checkout` | checkoutStore | **affiliateCode only** (program/plan ephemeral) |
| `tv-billing` | billingStore | all billing records |
| `tv-affiliate` | affiliateStore | profiles, referrals, payouts |
| `tv-theme` | themeStore | light/dark |
| — | portfolioStore | in-memory quotes only |
| — | tradingRoomStore | UI tab + toast only |

### 2.7 Mock data files (`src/lib/mock/`)

| File | Purpose |
|------|---------|
| `mockEvaluationAccounts.ts` | Account factory + types |
| `mockAssessmentPlans.ts` | Plan tiers ₹2L–₹25L, 1/2-Step programs |
| `mockAffiliate.ts` | Referral types, ₹500 commission, DEMO123 |
| `mockBilling.ts` | BillingRecord type |
| `mockInstruments.ts` | Universe + `DEFAULT_TRADABLE_INSTRUMENT_ID` |
| `mockOptionChains.ts` | Option chains |
| `mockQuotes.ts` / `mockCandles.ts` | Market data mocks |
| `mockEquityCurve.ts` | Stats chart |
| `mockContact.ts` / `mockFaq.ts` | Contact + FAQ |
| `mockUser.ts` | Legacy demo user |

---

## 3. Target backend architecture

```
                    ┌─────────────────────────────────────┐
                    │  CDN (Vercel / Cloudflare)          │
                    │  React SPA (tradeox)                │
                    └──────────────┬──────────────────────┘
                                   │ HTTPS
                    ┌──────────────▼──────────────────────┐
                    │  API Gateway / Express (Node 20+)   │
                    │  ├── /api/auth/*                    │
                    │  ├── /api/accounts/*                │
                    │  ├── /api/market/*                  │
                    │  ├── /api/checkout/*                │
                    │  └── WS /api/ws/quotes              │
                    └──────┬──────────────┬───────────────┘
                           │              │
              ┌────────────▼───┐   ┌──────▼──────────────┐
              │ Neon PostgreSQL │   │ Redis (optional)    │
              │ users, accounts │   │ quote cache, sessions│
              │ orders, billing │   └─────────────────────┘
              └────────────────┘
                           │
              ┌────────────▼────────────────────────────┐
              │ Market Data Adapter (your service)      │
              │ ├── TrueData / Global Datafeeds / etc.  │
              │ ├── Normalise → Quote, Candle, Chain  │
              │ └── Fan-out to WebSocket clients        │
              └─────────────────────────────────────────┘
```

### Recommended stack

| Layer | Choice | Why |
|-------|--------|-----|
| Runtime | **Node.js 20+ / Express** or **Fastify** | Matches PROJECT_DOCS; large TS ecosystem |
| ORM | **Prisma** | `backend/prisma/schema.prisma` → Neon |
| Database | **Neon PostgreSQL** | Serverless Postgres, branching for staging |
| Cache | **Redis** (Upstash) | Quote snapshots, rate limits, WS pub/sub |
| Auth | **JWT** access (15m) + refresh (7d) httpOnly cookie | Standard SPA pattern |
| Email | **Resend** / **SendGrid** | Verify-email flow |
| Payments | **Razorpay** | INR, UPI, cards (India) |
| Jobs | **BullMQ** + Redis | EOD square-off, inactivity, payout cycles |
| Market data | **Authorised Indian vendor** (see §8) | Legal real-time/delayed NSE/BSE |

---

## 4. Database — Prisma + Neon

**Schema file:** [`../prisma/schema.prisma`](../prisma/schema.prisma)

### 4.1 Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit DATABASE_URL with your Neon connection string

npm run db:generate
npm run db:migrate
npm run db:studio   # optional DB browser
```

Use [Neon](https://neon.tech) console → create project → copy pooled connection string into `DATABASE_URL`.

### 4.2 Prisma models (summary)

Last synced with `../src/` — June 2026.

| Model | Maps to frontend |
|-------|------------------|
| `User` | `authStore` — `AuthUser` + `registrationStep`, `startingBalance`, lockout fields |
| `UserPreferences` | Profile tabs + `mockUser.preferences` + `instrumentStore` / `evaluationAccountStore` UI state |
| `KillSwitchEvent` | ProfilePage Daily Kill Switch — one activation per trading day |
| `RefreshToken` / `EmailVerificationToken` | JWT + verify email |
| `AffiliateProfile` | `affiliateStore.profiles` — unique `code`, `seeded` flag (DEMO123) |
| `Referral` | `affiliateStore.referrals` — flat ₹500 commission |
| `AffiliatePayout` | `affiliateStore.payouts` |
| `TradingProgram` | `mockTradingPrograms` — stages + rules JSON |
| `EvaluationPlanTier` | `mockEvaluationPlanTiers` (plan-2L … plan-25L) |
| `EvaluationAccount` | `mockEvaluationAccounts` — rules, labels, margin fields |
| `EquityCurvePoint` | `mockEquityCurve` / `AccountStatsPage` chart |
| `EvaluationOrder` | `evaluationTradingStore.orders` — TP/SL/trigger, `timeInForce`, partial fills |
| `EvaluationPosition` | `evaluationTradingStore.positions` |
| `TradingBasket` | `evaluationTradingStore.basketSets` |
| `AccountTradingConfig` | `activeBasketByAccount`, `basketSizeMode` |
| `Instrument` | `mockInstruments` — category, badge, filterTags, bid/ask, options |
| `MarketQuote` | `portfolioStore.liveQuotes` / `mockQuotes` |
| `MarketCandle` | `mockCandles` / `ChartPanel` OHLCV |
| `Watchlist` / `WatchlistItem` | `instrumentStore.watchlists` |
| `BillingRecord` | `billingStore.records` — `paidAt` = frontend `date`, links `planId` |
| `FeedbackSubmission` | `ContactPage` / `mockContact` |
| `FaqCategory` / `FaqItem` | `mockFaq` nested categories |

### 4.3 Referral fields on `User`

```prisma
pendingAffiliateCode String?  // from ?ref= at signup / complete-profile (was checkoutStore)
```

On **paid checkout webhook**: resolve code → create `Referral` row → link `BillingRecord` → set commission ₹500.

### 4.4 Enum mapping notes

| Frontend | Prisma |
|----------|--------|
| `'1-Step'` / `'2-Step'` | `EvaluationStepType.STEP_1` / `STEP_2` |
| `'Mr.'` etc. | `ProfileTitle.Mr` (with `@map("Mr.")`) |
| `registrationStep` | `RegistrationStep` enum |
| `OrderStatus` | `pending`, `open`, `filled`, `partially_filled`, `cancelled`, `rejected` |
| `OrderType` | `market`, `limit`, `stop`, `stop_limit` |
| `OrderTimeInForce` | `day`, `gtc`, `ioc`, `fok` |
| `InstrumentCategory` | `index`, `future`, `equity`, `commodity`, `option` |
| `InstrumentBadge` | `INDEX`, `FUT`, `EQ`, `MCX`, `CE`, `PE` |
| `Exchange` | `NSE`, `BSE`, `MCX` |
| `TradingStyle` | `day`, `swing`, `longterm`, `passive` (`OnboardingPage`) |
| `ExperienceLevel` | `beginner`, `intermediate`, `advanced` |
| `DefaultOrderType` | `mockUser.preferences.defaultOrderType` |

### 4.4.1 `UserPreferences` fields (frontend mapping)

| Field | Source |
|-------|--------|
| `nickname`, `theme`, `onboardingHelp`, `commChannel` | `ProfilePage` Preferences tab |
| `defaultOrderType`, `confirmOrders`, `notify*` | `mockUser.preferences` |
| `tradingStyle`, `experienceLevel`, `onboardingSymbols` | `OnboardingPage` steps 2–3 |
| `activeAccountId` | `evaluationAccountStore.activeAccountId` |
| `activeInstrumentId`, `activeWatchlistId` | `instrumentStore` |
| `killSwitchActive`, `killSwitchActivatedAt` | ProfilePage Daily Kill Switch |

### 4.5 Seed script (recommended next step)

Create `backend/prisma/seed.ts` to load data from `../src/lib/mock/`:
- `TradingProgram` + `EvaluationPlanTier` from `mockAssessmentPlans.ts`
- `Instrument` rows from `mockInstruments.ts`
- `MarketQuote` from `mockQuotes.ts`
- `FaqCategory` + `FaqItem` from `mockFaq.ts`
- Demo affiliate `DEMO123`

```bash
npx prisma db seed
```

---

## 5. REST API specification

### Auth

| Method | Path | Maps to frontend |
|--------|------|------------------|
| POST | `/api/auth/register` | `AuthPage` Create Profile — `{ email, password }` → `registrationStep: registered` |
| POST | `/api/auth/login` | `AuthPage` Sign in — returns tokens, `email_verified` users → dashboard |
| POST | `/api/auth/refresh` | Silent token refresh |
| POST | `/api/auth/logout` | Clear refresh cookie |
| POST | `/api/auth/verify-email` | `VerifyEmailPage` — token or magic link |
| POST | `/api/auth/complete-profile` | `CompleteProfilePage` — see body below |
| GET | `/api/auth/me` | Hydrate `authStore` on app load |

**`POST /api/auth/complete-profile`**

```json
{
  "title": "Mr.",
  "fullName": "Sunraj Kumar",
  "phone": "+919876543210",
  "onboardingHelp": true,
  "affiliateCode": "DEMO123"
}
```

- Validate `affiliateCode` with same rules as `affiliateStore.validateCode`
- Save valid code to `User.pendingAffiliateCode` (replaces `checkoutStore.affiliateCode` on server)
- Set `registrationStep: profile_completed`

### Profile & preferences

| Method | Path | Maps to frontend |
|--------|------|------------------|
| PATCH | `/api/users/me` | Profile Personal tab — `nickname` |
| PATCH | `/api/users/me/preferences` | Preferences tab — `theme`, `onboardingHelp`, `commChannel`, notifications, kill switch |
| PATCH | `/api/users/me/trading-state` | `activeAccountId`, `activeInstrumentId`, `activeWatchlistId` |

### Referral (Profile → Refer & Earn)

| Method | Path | Maps to frontend |
|--------|------|------------------|
| GET | `/api/referral/me` | `ProfileReferralSection` — code, share URL, stats |
| GET | `/api/referral/me/referrals` | Pending + successful lists |
| GET | `/api/referral/me/payouts` | Payout history |
| POST | `/api/referral/validate` | `CompleteProfilePage` debounced check `{ code }` |
| POST | `/api/referral/request-payout` | Request payout (min ₹500 approved balance) |

`GET /api/referral/me` response shape:

```json
{
  "code": "SUNRAJ1A2B",
  "shareUrl": "https://app.tradeox.com/signup?ref=SUNRAJ1A2B",
  "stats": {
    "totalReferrals": 2,
    "pendingCommission": 500,
    "approvedCommission": 500,
    "paidCommission": 500
  }
}
```

### Evaluation accounts

| Method | Path | Maps to frontend |
|--------|------|------------------|
| GET | `/api/accounts` | `AccountsDashboardPage`, `AccountsListPage` |
| POST | `/api/accounts/free-trial` | `FreeTrialPage` → `createFreeTrial` |
| POST | `/api/accounts/paid` | Post-Razorpay webhook |
| GET | `/api/accounts/:id` | `ActiveAccountCard`, `TradingRoomStatusBar` |
| GET | `/api/accounts/:id/stats` | `AccountStatsPage` |
| GET | `/api/accounts/:id/equity-curve` | `EquityCurveChart` |

### Trading

| Method | Path | Maps to frontend |
|--------|------|------------------|
| POST | `/api/accounts/:id/orders` | `TradingRoomTradePanel` → `placeOrder` |
| GET | `/api/accounts/:id/orders` | `TradingRoomTabContent` orders tab |
| DELETE | `/api/accounts/:id/orders/:orderId` | `cancelOrder` |
| GET | `/api/accounts/:id/positions` | positions tab |
| PUT | `/api/accounts/:id/baskets` | basket CRUD in `evaluationTradingStore` |

**Request body for place order** (mirror `PlaceOrderInput`):

```json
{
  "instrumentId": "eq-hdfcbank",
  "side": "buy",
  "type": "market",
  "lots": 1,
  "limitPrice": null,
  "stopPrice": null,
  "triggerPrice": null,
  "takeProfitPrice": 760,
  "stopLossPrice": 740
}
```

### Market data (new — replaces mocks)

| Method | Path | Replaces |
|--------|------|----------|
| GET | `/api/market/instruments` | `mockInstruments` |
| GET | `/api/market/instruments/search?q=` | `SearchInstrumentsModal` |
| GET | `/api/market/quotes/:symbol` | `mockQuotes[symbol]` |
| GET | `/api/market/candles/:symbol` | `mockCandles[symbol]` |
| GET | `/api/market/options/:underlying` | `mockOptionChains` |

**Candles query params:**

```
GET /api/market/candles/NIFTY?interval=1d&from=2025-01-01&to=2026-06-01
GET /api/market/candles/HDFCBANK?interval=1m&from=2026-06-03T09:15:00&to=2026-06-03T15:30:00
```

**Response shape** (must match frontend `Candle` interface):

```json
{
  "symbol": "NIFTY",
  "interval": "1d",
  "candles": [
    { "time": 1717506900, "open": 23200, "high": 23350, "low": 23180, "close": 23310, "volume": 0 }
  ]
}
```

`time` = **Unix seconds** (UTC). `ChartPanel` maps to `lightweight-charts` `UTCTimestamp`.

### Checkout, billing, support

| Method | Path | Maps to |
|--------|------|---------|
| GET | `/api/plans` | `mockAssessmentPlans` — programs + tiers |
| POST | `/api/checkout/create` | `EvaluationCheckoutPage` — Razorpay order |
| POST | `/api/checkout/webhook` | On `paid`: create account, `BillingRecord`, **`Referral` if `pendingAffiliateCode`**, `markEvaluationStarted` |
| GET | `/api/billing/history` | `BillingPage` |
| GET | `/api/faq` | `FaqPage` — categories + search |
| POST | `/api/contact/feedback` | `ContactPage` — `{ category, message }` |
| GET/PUT | `/api/watchlists` | `instrumentStore` multi-watchlist sync |

---

## 6. WebSocket & real-time data

Replace `src/hooks/useMockTicker.ts` with a server fan-out:

```
Client                    Your API                    Data vendor
  │                          │                            │
  │── WS connect + JWT ─────►│                            │
  │── subscribe ["NIFTY",    │                            │
  │            "HDFCBANK"] ─►│── vendor WS subscribe ────►│
  │                          │◄── ticks / 1m bars ────────│
  │◄── { symbol, price,      │                            │
  │     changePct, ts } ─────│                            │
```

### Message format (proposed)

```json
{
  "type": "quote",
  "symbol": "NIFTY",
  "price": 23350.95,
  "change": 125.40,
  "changePct": 0.54,
  "bid": 23350.00,
  "ask": 23351.00,
  "lastUpdated": "2026-06-03T10:15:00.000Z"
}
```

### Server-side triggers on each tick

1. Update Redis quote cache  
2. Push to subscribed WebSocket clients  
3. Run **pending order fill** logic (`tryFillPendingOrders` in `evaluationTradingStore`)  
4. Update position LTP (`updatePositionLtp`)  
5. Recompute account equity / daily loss / breach checks  

**Important:** Order matching and account state **must run on the server** in production. Client-side Zustand is fine for demos only.

---

## 7. Charts — current features & backend requirements

### Library: TradingView Lightweight Charts v5

**File:** `src/components/dashboard/ChartPanel.tsx`  
**Used in:** Trading Room (`variant="terminal"`)

### Implemented today (UI)

| Feature | Status | Backend needed |
|---------|--------|----------------|
| Candlestick / line / area | ✅ Working on mock | OHLCV API per interval |
| Timeframes 5D, 1M, 3M, 6M, 1Y | ✅ Filters mock daily bars | Historical daily candles |
| Terminal **1m** button | ⚠️ UI only — still uses daily mock data sliced by days | **1-minute intraday candles** |
| MA 20 / MA 50 overlays | ✅ Computed client-side | Candles sufficient |
| Live price in header | ✅ From `portfolioStore.liveQuotes` | WebSocket quotes |
| Symbol search (terminal) | ✅ Via `instrumentStore` | Instrument search API |
| Drawing tools rail (pencil, ruler, etc.) | ⚠️ **Icons only — not functional** | Optional: save drawings in DB per user/chart |
| Indicators button (terminal) | ⚠️ Toggles MA only | More indicators = client compute or vendor |
| Undo/redo, save, screenshot | ⚠️ UI placeholders | N/A |
| Hide chart | ✅ UI state | N/A |
| Legend: "Mock Data · Daily OHLCV" | Shows mock mode | Remove when live |

### Equity curve (Account Stats)

**File:** `src/components/stats/EquityCurveChart.tsx`  
**Library:** Recharts  
**Data:** `buildMockEquityCurve()` → replace with `GET /api/accounts/:id/equity-curve`

### Chart data intervals you must support

| UI label | Interval | Use case | Vendor typical name |
|----------|----------|----------|---------------------|
| 1m | 1 minute | Intraday trading room | `1min` bar stream |
| 5D | 1 day (last 5 sessions) | Short history | Daily OHLCV |
| 1M / 3M / 6M / 1Y | 1 day | Swing context | Daily OHLCV |
| Live tick | Tick or 1s aggregated | Bid/ask on trade panel | LTP stream |

Exchange-approved bar intervals (per authorised vendors like TrueData): **Tick, 1m, 2m, 5m, 15m (delayed), EOD** — custom intervals need exchange approval.

### Option A — Keep Lightweight Charts (recommended for tradeox)

**Pros:** Already integrated, free OSS, full UI control, no per-user charting license  
**Cons:** You build indicators, drawings, option chain UI yourself  
**You purchase:** Market **data** API only (candles + quotes), not charting software

### Option B — Embed TradingView Charting Library / Widget

**Pros:** 100+ indicators, drawings, professional UX out of the box  
**Cons:** Separate **TradingView commercial license** + **NSE/BSE data packages** on TradingView  
**Purchase:**
- [TradingView Charting Library](https://www.tradingview.com/charting-library-docs/) — enterprise license (contact sales)
- [NSE/BSE data on TradingView](https://www.tradingview.com/data-coverage/) — per-exchange subscription for real-time

Use if you want TradingView-identical charts without building drawing tools.

### Option C — Broker API (ICICI Breeze, Upstox, Angel One, etc.)

**Pros:** Free or low-cost data **for your own broker customers**  
**Cons:** Only for users with that broker account; not a general prop-evaluation platform feed; SEBI static IP rules from Apr 2026 for API trading  
**Fit:** Secondary integration, not primary data layer for tradeox

---

## 8. Market data for India (NSE / BSE / MCX)

### Symbols in tradeox today

**Indices (view-only on chart):**

| Symbol | Exchange | Chart quote key |
|--------|----------|-----------------|
| NIFTY (Nifty 50) | NSE | `NIFTY` |
| BANKNIFTY | NSE | `BANKNIFTY` |
| FINNIFTY | NSE | maps via `getChartSymbol()` |
| MIDCPNIFTY | NSE | maps via `getChartSymbol()` |
| SENSEX | BSE | `SENSEX` |

**Equities with mock quotes + candles (10):**  
`RELIANCE`, `HDFCBANK`, `INFY`, `TCS`, `ICICIBANK`, `SBI`, `BHARTIARTL`, `AXISBANK` (+ indices above)

**Futures / commodities / options:** Listed in `mockInstruments.ts`; options chains in `mockOptionChains.ts` for NIFTY, BANKNIFTY, FINNIFTY, MIDCPNIFTY, SENSEX.

**Default tradable symbol:** `HDFCBANK` (`eq-hdfcbank`)

### Symbol mapping (keep this logic on backend)

`getChartSymbol()` in `mockInstruments.ts` maps derivatives to underlying quote keys, e.g.:

- `NIFTY-FUT` → quote stream `NIFTY`
- `NIFTY24JUN24000CE` → underlying `NIFTY` for index chart + separate option LTP

Replicate as `instruments.chart_symbol` column.

### What “dynamic” means for each layer

| Layer | Mock today | Dynamic production |
|-------|------------|-------------------|
| **LTP / bid / ask** | Random ±0.4% every 1.5s | Vendor WebSocket tick |
| **Daily candles** | 180 generated bars | Vendor historical API + daily EOD job |
| **1m candles** | Not real | Vendor intraday history + live bar builder |
| **Option chain** | Generated strikes/expiries | Vendor option chain API (TrueData, Upstox, Breeze) |
| **Instrument search** | Static array filter | Search index over instrument master |
| **Order fills** | Client Zustand | Server matches price from same feed |

### Polygon.io — **not suitable as primary India feed**

`PROJECT_DOCS.md` mentions Polygon.io — that is **US-focused**. Do **not** rely on Polygon for NIFTY/BSE live prices. Use an **India-authorised vendor** (below).

---

## 9. API & subscription purchase guide

### Decision matrix

| Your goal | Recommended approach | Purchase? |
|-----------|---------------------|-----------|
| **MVP / dev only** | Keep mocks + recorded tick files | **No** |
| **Demo with delayed prices** | Authorised vendor **15-min delayed** snapshot | **Yes** — lower tier |
| **Production evaluation platform** | Authorised vendor **real-time** NSE EQ + NSE F&O + indices | **Yes** — required |
| **BSE SENSEX real-time** | BSE package (often extra vs NSE) | **Yes** — add-on |
| **MCX commodities** | MCX segment license | **Yes** — add-on |
| **Full TradingView-style charts** | TradingView library + TV data subs | **Yes** — chart license + data |
| **Only your broker clients** | Breeze / Upstox / Zerodha Kite API | Broker account required |

### Tier 1 — Authorised Indian data vendors (recommended for tradeox)

Contact for **custom API quotes** (pricing depends on segments, symbol count, real-time vs delayed).

| Vendor | Coverage | API types | Notes |
|--------|----------|-----------|-------|
| **[TrueData](https://www.truedata.in/products/marketdataapi)** | NSE EQ, indices, F&O, CDS, MCX; BSE | REST, WebSocket, tick + 1m/5m bars, option chain, greeks | NSE-empanelled; ~10-day trial; exchange fees separate |
| **[Global Datafeeds](https://globaldatafeeds.in/)** | NSE, BSE, MCX, NCDEX | WebSocket, REST, .NET, FIX | Long-running vendor; chart platform integrations |
| **[Accelpix](https://www.accelpix.com/)** | NSE, BSE | APIs for fintech | Listed NSE authorised vendor |
| **[Definedge](https://definedgesec.com/)** | NSE ecosystem | Data + analytics | Authorised vendor |
| **NSE direct** ([DotEx](https://www.nseindia.com/static/market-data/real-time-data-subscription)) | All NSE segments | Leased line / multicast | Enterprise; ₹40L+ reported for 6mo real-time commercial use |

**TrueData Velocity plugin pricing (reference only — NOT the API product):**  
NSE EQ / NSE F&O segments ≈ **₹1,440–₹2,800/month** per segment for terminal software. **API pricing is separate** — request quote at [truedata.in/products/marketdataapi](https://www.truedata.in/products/marketdataapi).

**Reported industry ballpark (virtual trading / commercial apps, verify with vendor):**
- Real-time commercial display: **₹15L–₹40L+ per 6 months** (exchange + vendor, varies by user count & medium)
- 15-minute delayed snapshot: **much lower** (₹2L/6mo range cited in press — confirm with NSE DotEx tariff)

### Tier 2 — Broker APIs (supplementary)

| API | Cost | Data included | Limitation |
|-----|------|---------------|------------|
| **[ICICI Breeze](https://www.icicidirect.com/futures-and-options/api/breeze)** | Free for ICICI customers | Real-time WS, 3yr history, option chain | Users need ICICI account; static IP mandatory Apr 2026 |
| **[Upstox Market Feed](https://upstox.com/developer/api-documentation/get-market-data-feed)** | Free with Upstox dev account | WS protobuf, ltpc / full / option_chain modes | Upstox instrument keys; not white-label |
| **Zerodha Kite Connect** | ₹2,000/month per app | Historical + live with connect | Order placement tied to Zerodha |

Use for **internal testing** or **linked brokerage** features — not as the sole data source for a public evaluation product.

### Tier 3 — Unofficial / scrapers (do not use in production)

npm packages like `stock-nse-india`, scraping NSE website — **not licensed** for commercial real-time display. NSE has issued **cease & desist** to unlicensed virtual trading apps.

### Tier 4 — TradingView data (if embedding TV charts)

| Item | Action |
|------|--------|
| NSE F&O real-time on TradingView | [TV support doc](https://www.tradingview.com/support/solutions/43000777677) — non-pro users often get NSE RT by default; BSE needs package |
| BSE real-time | Purchase BSE data package on TradingView |
| Charting Library | Enterprise license from TradingView |

### What to buy for tradeox minimum production

**Recommended starter bundle (request quotes from TrueData or Global Datafeeds):**

1. **NSE Indices** — NIFTY 50, BANKNIFTY, FINNIFTY, MIDCPNIFTY (real-time or 15m delayed for MVP)
2. **NSE F&O** — futures + options chain for tradable contracts
3. **NSE Equity** — top 200 liquid names (or full universe if budget allows)
4. **BSE SENSEX index** — if you show BSE index page
5. **MCX** — if commodity futures in `mockInstruments` stay in scope
6. **Historical daily + 1-minute** — backfill charts and account stats

**Optional later:** BSE equities, corporate actions, news feeds.

### Infrastructure costs (excluding market data)

| Service | Est. monthly |
|---------|----------------|
| Neon PostgreSQL (Pro) | $19–69 |
| Railway/Render API hosting | $20–100 |
| Upstash Redis | $0–30 |
| Resend email | $0–20 |
| Razorpay | % per transaction |
| **Market data vendor** | **₹50,000–₹5,00,000+** (highly variable) |

---

## 10. Order engine & evaluation logic

Port client logic from `src/store/evaluationTradingStore.ts` to server:

### Order types supported in UI

| Type | Fields | Fill rule |
|------|--------|-----------|
| `market` | optional `triggerPrice`, TP/SL stored | Fill at bid/ask immediately |
| `limit` | `limitPrice` | Fill when price crosses limit |
| `stop` | `stopPrice` | Trigger then market fill |

### Account rules (from `mockAssessmentPlans`)

**2-Step:** 10% / 5% profit targets, 10% max loss, 5% daily max loss, 4 min days, 90% split  
**1-Step:** 10% target, 10% EOD trailing max loss, 3% daily loss, best-day ≤50%

### Scheduled jobs

| Job | Schedule | Action |
|-----|----------|--------|
| Intraday square-off | 15:15 IST | Close all positions, cancel open orders |
| Daily loss reset | 00:00 IST | Reset `todayPnL` / daily loss counters |
| Inactivity check | Daily | Close account after 30 days no trades |
| EOD equity snapshot | 15:30 IST | Append `equity_curve_points` |
| Breach monitor | On each tick | Fail account if loss limits exceeded |

---

## 11. Payments, referral & billing

| Feature | Frontend | Backend (Prisma) |
|---------|----------|------------------|
| Checkout | `EvaluationCheckoutPage` | Razorpay → webhook → `EvaluationAccount` + `BillingRecord` |
| Billing history | `BillingPage` | `BillingRecord` filtered by `userId` |
| Referral code entry | `CompleteProfilePage` | Save `User.pendingAffiliateCode` after validate |
| Referral share UI | `ProfileReferralSection` | `AffiliateProfile.code`, `GET /api/referral/me` |
| Attribution on pay | `recordReferralFromCheckout` | Create `Referral` (₹500), link to `BillingRecord` |
| Payout request | Profile referral tab (future button) | `AffiliatePayout`, min ₹500 |
| Free trial | `FreeTrialPage` | `POST /api/accounts/free-trial` — no `BillingRecord` |

**Webhook pseudocode:**

```ts
// After Razorpay payment success
const user = await prisma.user.findUnique({ where: { id: userId } })
const billing = await prisma.billingRecord.create({ ... })
if (user.pendingAffiliateCode) {
  await prisma.referral.create({
    data: {
      affiliateUserId: resolveOwner(user.pendingAffiliateCode),
      buyerUserId: user.id,
      referredName: user.name,
      referredEmail: user.email,
      program: `${stepType} · ₹${accountSize}`,
      orderAmount: fee,
      commissionAmount: 500,
      status: 'pending',
      billingRecordId: billing.id,
    },
  })
}
await prisma.user.update({
  where: { id: userId },
  data: { registrationStep: 'evaluation_started', pendingAffiliateCode: null },
})
```

Plan tiers from `mockEvaluationPlanTiers`: ₹2L–₹25L balances, fees ₹2,999–₹19,999.

---

## 12. Environment variables

Environment files:

### Backend (`backend/.env`)

```bash
# Server
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://app.tradeox.com

# Database
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/tradeox?sslmode=require

# Auth
JWT_SECRET=                    # 64+ char random
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Email
RESEND_API_KEY=

# Payments (India)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Market data vendor (example — rename per provider)
MARKET_DATA_VENDOR=truedata
TRUEDATA_USER=
TRUEDATA_PASSWORD=
TRUEDATA_API_KEY=

# Redis (optional)
REDIS_URL=

# Static IP note: SEBI requires static IP for broker API trading from Apr 2026
# Deploy API on fixed-egress VPS if using broker APIs for execution
```

### Frontend (repo root `.env.local`)

```bash
VITE_API_BASE_URL=http://localhost:4000/api
VITE_WS_URL=ws://localhost:4000/api/ws/quotes
VITE_RAZORPAY_KEY_ID=           # public key only
```

---

## 13. Frontend integration plan

### Step 1 — API client

```
../src/lib/api/
├── client.ts       # fetch wrapper + auth header refresh
├── auth.ts
├── accounts.ts
├── orders.ts
└── market.ts
```

### Step 2 — React Query

Wrap app in `QueryClientProvider`; replace direct mock imports:

```typescript
// Before
const quote = mockQuotes[symbol]

// After
const { data: quote } = useQuery({
  queryKey: ['quote', symbol],
  queryFn: () => marketApi.getQuote(symbol),
  refetchInterval: 5_000, // fallback if WS drops
})
```

### Step 3 — WebSocket hook

Replace `useMockTicker`:

```typescript
// src/hooks/useMarketDataStream.ts
export function useMarketDataStream(symbols: string[]) {
  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}?token=...`)
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'quote') {
        usePortfolioStore.getState().updateQuote(msg.symbol, msg.price, msg.changePct)
      }
    }
    ws.send(JSON.stringify({ action: 'subscribe', symbols }))
    return () => ws.close()
  }, [symbols])
}
```

### Step 4 — ChartPanel

```typescript
// Replace mockCandles import with:
const { data: candles } = useQuery({
  queryKey: ['candles', symbol, timeframe],
  queryFn: () => marketApi.getCandles(symbol, mapTimeframe(timeframe)),
})
```

### Step 5 — Trading actions

`placeOrder` → `POST /api/accounts/:id/orders` then sync Zustand from response (or invalidate queries).

### Files to touch (priority order)

| Priority | File | Change |
|----------|------|--------|
| P0 | `useMockTicker.ts` | Replace with WS |
| P0 | `ChartPanel.tsx` | Fetch candles from API |
| P0 | `evaluationTradingStore.ts` | Server-authoritative orders |
| P1 | `authStore.ts` | Real JWT auth |
| P1 | `evaluationAccountStore.ts` | Fetch accounts from API |
| P2 | `instrumentStore.ts` | Server watchlists |
| P2 | `billingStore.ts`, `affiliateStore.ts` | API-backed |

---

## 14. Phased rollout

### Phase 0 — Now (complete)

- Frontend evaluation flow with mocks  
- Lightweight Charts + mock OHLCV  
- Zustand persistence  

### Phase 1 — Backend foundation (4–6 weeks)

- Express + Neon + JWT auth  
- Accounts CRUD + equity curve  
- Deploy staging API  

### Phase 2 — Market data MVP (4–8 weeks + vendor onboarding)

- Sign vendor trial (TrueData / Global Datafeeds)  
- Implement `/api/market/quotes` + WebSocket  
- **15-minute delayed** data acceptable for first public beta (confirm license)  
- Wire `ChartPanel` + trade panel LTP  

### Phase 3 — Trading engine (3–4 weeks)

- Server-side `placeOrder`, fills, margin checks  
- Intraday square-off job  
- Breach / pass detection  

### Phase 4 — Payments & production data (4–6 weeks)

- Razorpay live  
- Upgrade to **real-time** vendor tier if licensed  
- 1-minute candles for trading room  
- Option chain API  

### Phase 5 — Polish

- Functional drawing tools (or TradingView embed)  
- More indicators  
- Certificates auto-issue, rewards eligibility  
- KYC integration (external provider)  

---

## 15. Compliance checklist

Before going live with real market data:

- [ ] Contract with **NSE/BSE-authorised data vendor** (not scraped data)
- [ ] Clarify with vendor: **evaluation / simulated trading** use case (commercial display)
- [ ] Display **required exchange disclaimers** on trading room and charts
- [ ] Label **delayed vs real-time** clearly in UI if using delayed feed
- [ ] Do not redistribute raw feed to third parties (vendor ToS)
- [ ] Terms of service: tradeox is **not a broker** / **not SEBI-registered** (see landing disclaimer)
- [ ] Razorpay KYC for merchant account
- [ ] User data: IT Act / DPDP compliance for India
- [ ] Static IP for broker execution APIs (SEBI, from Apr 2026) if applicable

---

## Quick reference — mock → API mapping

| Mock file | API endpoint |
|-----------|--------------|
| `mockQuotes.ts` | `GET /api/market/quotes/:symbol` + WS |
| `mockCandles.ts` | `GET /api/market/candles/:symbol` |
| `mockInstruments.ts` | `GET /api/market/instruments` |
| `mockOptionChains.ts` | `GET /api/market/options/:underlying` |
| `mockEvaluationAccounts.ts` | `GET/POST /api/accounts` |
| `mockAssessmentPlans.ts` | `GET /api/plans` |
| `mockEquityCurve.ts` | `GET /api/accounts/:id/equity-curve` |
| `evaluationTradingStore` orders | `POST/GET /api/accounts/:id/orders` |
| `affiliateStore` | `GET /api/referral/me` + webhook attribution |
| `checkoutStore.affiliateCode` | `User.pendingAffiliateCode` on server |
| `instrumentStore.watchlists` | `GET/PUT /api/watchlists` |
| `mockFaq.ts` | `GET /api/faq` |
| `mockContact` feedback | `POST /api/contact/feedback` |
| `useMockTicker.ts` | `WS /api/ws/quotes` |

---

## Summary answer: “Do I need to purchase APIs?”

| Feature | Free possible? | What to buy |
|---------|----------------|-------------|
| Backend hosting + DB | Free tiers exist (Neon, Render) | Paid for production scale |
| Auth / email | Free tiers (Resend) | Low cost |
| **NIFTY 50 / BSE live charts** | **No** (for legal commercial app) | **Authorised Indian market data API** |
| **1-minute intraday candles** | No | Same vendor — intraday/historical package |
| **Option chain** | No | Vendor option chain API |
| **TradingView-level drawings** | Build yourself on Lightweight Charts | Free OSS, or **TradingView license** |
| **Polygon.io** | US data free tier | **Not for India indices** |

**Bottom line:** Budget for an **NSE-empanelled market data vendor** (TrueData, Global Datafeeds, or similar) before launching dynamic NIFTY/BSE charts to paying users. Start with a **vendor trial** and **delayed data** for development; upgrade to **real-time** after legal/commercial terms are signed.

---

*© 2026 tradeox — Internal engineering document. Market data pricing and exchange rules change frequently; confirm all figures with vendors and NSE DotEx before purchasing.*
