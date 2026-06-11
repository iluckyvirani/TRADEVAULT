import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import AuthGuard, { GuestGuard, RegistrationGuard } from '@/components/auth/AuthGuard'
import AuthBootstrap from '@/components/auth/AuthBootstrap'
import MarketBootstrap from '@/components/market/MarketBootstrap'
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
const FreeTrialPage = lazy(() => import('@/pages/FreeTrialPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const BillingPage = lazy(() => import('@/pages/BillingPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const FaqPage = lazy(() => import('@/pages/FaqPage'))

function SignupRedirect() {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const ref = params.get('ref')
  const target = ref
    ? `/auth?tab=create&ref=${encodeURIComponent(ref)}`
    : '/auth?tab=create'
  return <Navigate to={target} replace />
}

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
      <AuthBootstrap>
        <MarketBootstrap />
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
          <Route path="/signup" element={<SignupRedirect />} />
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
            <Route path="/free-trial" element={<Suspense fallback={<AppPageFallback />}><FreeTrialPage /></Suspense>} />
            <Route path="/profile" element={<Suspense fallback={<AppPageFallback />}><ProfilePage /></Suspense>} />
            <Route path="/affiliate" element={<Navigate to="/profile?tab=referral" replace />} />
            <Route path="/billing" element={<Suspense fallback={<AppPageFallback />}><BillingPage /></Suspense>} />
            <Route path="/faq" element={<Suspense fallback={<AppPageFallback />}><FaqPage /></Suspense>} />
            <Route path="/contact" element={<Suspense fallback={<AppPageFallback />}><ContactPage /></Suspense>} />
            <Route path="/certificates" element={<Navigate to="/dashboard" replace />} />
            <Route path="/rewards" element={<Navigate to="/dashboard" replace />} />
            <Route path="/chatbot" element={<Navigate to="/dashboard" replace />} />
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
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
      </AuthBootstrap>
    </BrowserRouter>
  )
}

