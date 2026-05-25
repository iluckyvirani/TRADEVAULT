import { Link } from 'react-router-dom'
import { TrendingUp, Globe, Code2, Briefcase, MessageCircle } from 'lucide-react'

const LINKS: Record<string, string[]> = {
  Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Settings'],
}

const SOCIALS = [
  { Icon: Globe, label: 'Twitter / X' },
  { Icon: Code2, label: 'GitHub' },
  { Icon: Briefcase, label: 'LinkedIn' },
  { Icon: MessageCircle, label: 'Discord' },
]

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/20">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              TradeVault
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              The professional paper trading platform. Trade smarter. Risk nothing.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <h3 className="mb-4 text-sm font-semibold text-foreground">{section}</h3>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 TradeVault Inc. All rights reserved.</p>
          <p>Not financial advice. Paper trading only. For educational purposes.</p>
        </div>
      </div>
    </footer>
  )
}
