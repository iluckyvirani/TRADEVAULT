import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from '@/components/auth/AuthGuard'
import AppShell from '@/components/shell/AppShell'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { PageSkeleton, DashboardSkeleton } from '@/components/ui/Skeleton'

// ── Code-split every page ──────────────────────────────────────────────────────
const LandingPage    = lazy(() => import('@/pages/LandingPage'))
const SignupPage     = lazy(() => import('@/pages/SignupPage'))
const LoginPage      = lazy(() => import('@/pages/LoginPage'))
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'))
const DashboardPage  = lazy(() => import('@/pages/DashboardPage'))
const TradePage      = lazy(() => import('@/pages/TradePage'))
const PortfolioPage  = lazy(() => import('@/pages/PortfolioPage'))
const WatchlistPage  = lazy(() => import('@/pages/WatchlistPage'))
const AnalyticsPage  = lazy(() => import('@/pages/AnalyticsPage'))
const JournalPage    = lazy(() => import('@/pages/JournalPage'))
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'))
const SettingsPage   = lazy(() => import('@/pages/SettingsPage'))

function AppPageFallback() {
  return (
    <div className="p-4 md:p-6">
      <PageSkeleton />
    </div>
  )
}

function DashboardFallback() {
  return (
    <div className="p-4 md:p-6">
      <DashboardSkeleton />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary label="Application error">
        <Routes>
          {/* Public */}
          <Route
            path="/"
            element={
              <Suspense fallback={null}>
                <LandingPage />
              </Suspense>
            }
          />
          <Route
            path="/signup"
            element={
              <Suspense fallback={null}>
                <SignupPage />
              </Suspense>
            }
          />
          <Route
            path="/login"
            element={
              <Suspense fallback={null}>
                <LoginPage />
              </Suspense>
            }
          />
          {/* Onboarding */}
          <Route
            path="/onboarding"
            element={
              <AuthGuard>
                <Suspense fallback={<AppPageFallback />}>
                  <OnboardingPage />
                </Suspense>
              </AuthGuard>
            }
          />
          {/* App shell – auth required */}
          <Route
            element={
              <AuthGuard>
                <AppShell />
              </AuthGuard>
            }
          >
            <Route
              path="/dashboard"
              element={
                <ErrorBoundary label="Dashboard error">
                  <Suspense fallback={<DashboardFallback />}>
                    <DashboardPage />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/trade"
              element={
                <ErrorBoundary label="Trade page error">
                  <Suspense fallback={<AppPageFallback />}>
                    <TradePage />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/trade/:symbol"
              element={
                <ErrorBoundary label="Trade page error">
                  <Suspense fallback={<AppPageFallback />}>
                    <TradePage />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/portfolio"
              element={
                <ErrorBoundary label="Portfolio error">
                  <Suspense fallback={<AppPageFallback />}>
                    <PortfolioPage />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/watchlist"
              element={
                <ErrorBoundary label="Watchlist error">
                  <Suspense fallback={<AppPageFallback />}>
                    <WatchlistPage />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/analytics"
              element={
                <ErrorBoundary label="Analytics error">
                  <Suspense fallback={<AppPageFallback />}>
                    <AnalyticsPage />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/journal"
              element={
                <ErrorBoundary label="Journal error">
                  <Suspense fallback={<AppPageFallback />}>
                    <JournalPage />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ErrorBoundary label="Leaderboard error">
                  <Suspense fallback={<AppPageFallback />}>
                    <LeaderboardPage />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/settings"
              element={
                <ErrorBoundary label="Settings error">
                  <Suspense fallback={<AppPageFallback />}>
                    <SettingsPage />
                  </Suspense>
                </ErrorBoundary>
              }
            />
          </Route>
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

