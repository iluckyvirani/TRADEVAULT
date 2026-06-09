import { Link } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'

const LINKS: Record<string, { label: string; to: string }[]> = {
  Platform: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Free trial', to: '/free-trial' },
    { label: 'Start evaluation', to: '/evaluation' },
    { label: 'Refer & Earn', to: '/profile?tab=referral' },
  ],
  Account: [
    { label: 'Profile', to: '/profile' },
    { label: 'Billing', to: '/billing' },
  ],
  Support: [
    { label: 'FAQ', to: '/faq' },
    { label: 'Contact', to: '/contact' },
    { label: 'Sign in', to: '/auth?tab=signin' },
    { label: 'Create account', to: '/auth?tab=create' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              tradeox
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Structured prop firm evaluation for disciplined intraday traders in Indian
              markets. Simulated environment · transparent rules · performance-based rewards.
            </p>
          </div>

          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <h3 className="mb-4 text-sm font-semibold text-foreground">{section}</h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} tradeox. All rights reserved.</p>
          <p className="max-w-lg text-center sm:text-right">
            Simulated evaluation only. Not financial advice. Not a stock broker or SEBI
            intermediary.
          </p>
        </div>
      </div>
    </footer>
  )
}
