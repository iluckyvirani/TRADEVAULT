import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard, { GuestGuard, RegistrationGuard } from '@/components/auth/AuthGuard'
import EvaluationShell from '@/components/evaluation/EvaluationShell'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { PageSkeleton, DashboardSkeleton } from '@/components/ui/Skeleton'

// ── Code-split every page ──────────────────────────────────────────────────────
const LandingPage    = lazy(() => import('@/pages/LandingPage'))
const AuthPage            = lazy(() => import('@/pages/AuthPage'))
const CompleteProfilePage = lazy(() => import('@/pages/CompleteProfilePage'))
const VerifyEmailPage     = lazy(() => import('@/pages/VerifyEmailPage'))
const AuthLoadingPage     = lazy(() => import('@/pages/AuthLoadingPage'))
const OnboardingPage      = lazy(() => import('@/pages/OnboardingPage'))
const AccountsDashboardPage = lazy(() => import('@/pages/AccountsDashboardPage'))
const AccountsListPage      = lazy(() => import('@/pages/AccountsListPage'))
const AccountStatsPage      = lazy(() => import('@/pages/AccountStatsPage'))
const TradingRoomPage       = lazy(() => import('@/pages/TradingRoomPage'))
const EvaluationCheckoutPage = lazy(() => import('@/pages/EvaluationCheckoutPage'))
const PlaceholderPage       = lazy(() => import('@/pages/PlaceholderPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))

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
            element={<Navigate to="/auth?tab=create" replace />}
          />
          <Route
            path="/login"
            element={<Navigate to="/auth?tab=signin" replace />}
          />
          <Route
            path="/auth"
            element={
              <GuestGuard>
                <Suspense fallback={null}>
                  <AuthPage />
                </Suspense>
              </GuestGuard>
            }
          />
          <Route
            path="/auth/complete-profile"
            element={
              <RegistrationGuard requiredStep="registered">
                <Suspense fallback={null}>
                  <CompleteProfilePage />
                </Suspense>
              </RegistrationGuard>
            }
          />
          <Route
            path="/auth/verify-email"
            element={
              <RegistrationGuard requiredStep="profile_completed">
                <Suspense fallback={null}>
                  <VerifyEmailPage />
                </Suspense>
              </RegistrationGuard>
            }
          />
          <Route
            path="/auth/loading"
            element={
              <AuthGuard>
                <Suspense fallback={null}>
                  <AuthLoadingPage />
                </Suspense>
              </AuthGuard>
            }
          />
          {/* Legacy auth pages — redirect handled above */}
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
          {/* Evaluation app shell */}
          <Route
            element={
              <AuthGuard>
                <EvaluationShell />
              </AuthGuard>
            }
          >
            <Route
              path="/dashboard"
              element={
                <ErrorBoundary label="Dashboard error">
                  <Suspense fallback={<DashboardFallback />}>
                    <AccountsDashboardPage />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route path="/accounts" element={<Suspense fallback={<AppPageFallback />}><AccountsListPage /></Suspense>} />
            <Route
              path="/accounts/:accountId/stats"
              element={
                <Suspense fallback={<AppPageFallback />}>
                  <AccountStatsPage />
                </Suspense>
              }
            />
            <Route path="/evaluation" element={<Suspense fallback={<AppPageFallback />}><EvaluationCheckoutPage /></Suspense>} />
            <Route path="/profile" element={<Suspense fallback={<AppPageFallback />}><PlaceholderPage title="Profile" /></Suspense>} />
            <Route path="/affiliate" element={<Suspense fallback={<AppPageFallback />}><PlaceholderPage title="Affiliate" /></Suspense>} />
            <Route path="/certificates" element={<Suspense fallback={<AppPageFallback />}><PlaceholderPage title="Certificates" /></Suspense>} />
            <Route path="/billing" element={<Navigate to="/evaluation" replace />} />
            <Route path="/rewards" element={<Suspense fallback={<AppPageFallback />}><PlaceholderPage title="Rewards" /></Suspense>} />
            <Route path="/contact" element={<Suspense fallback={<AppPageFallback />}><PlaceholderPage title="Contact" /></Suspense>} />
            <Route path="/chatbot" element={<Suspense fallback={<AppPageFallback />}><PlaceholderPage title="Chatbot" /></Suspense>} />
            {/* Legacy broker routes */}
            <Route path="/trade" element={<Navigate to="/dashboard" replace />} />
            <Route path="/trade/:symbol" element={<Navigate to="/dashboard" replace />} />
            <Route path="/portfolio" element={<Navigate to="/dashboard" replace />} />
            <Route path="/watchlist" element={<Navigate to="/dashboard" replace />} />
            <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
            <Route path="/journal" element={<Navigate to="/dashboard" replace />} />
            <Route path="/leaderboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
          </Route>
          {/* Trading room — no sidebar */}
          <Route
            path="/accounts/:accountId/trading-room"
            element={
              <AuthGuard>
                <Suspense fallback={null}>
                  <TradingRoomPage />
                </Suspense>
              </AuthGuard>
            }
          />
          {/* Legacy shell (hidden) */}
          <Route path="/dashboard-old" element={<AuthGuard><Suspense fallback={<DashboardFallback />}><DashboardPage /></Suspense></AuthGuard>} />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

