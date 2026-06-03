import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Platform', href: '#features' },
  { label: 'Plans', href: '#pricing' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 h-16 transition-all duration-300',
        scrolled
          ? 'border-b border-border bg-background/90 backdrop-blur-xl shadow-lg'
          : 'bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
          <TrendingUp className="h-6 w-6 text-primary" />
          tradeox
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/auth?tab=signin"
            className="px-4 py-2 text-sm text-foreground transition-colors hover:text-primary"
          >
            Log in
          </Link>
          <Link
            to="/free-trial"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
          >
            Free trial
          </Link>
          <Link
            to="/auth?tab=create"
            className="rounded-lg bg-[#002D5B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#003d7a]"
          >
            Start evaluation
          </Link>
        </div>

        <button
          type="button"
          className="p-2 text-foreground md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="flex flex-col gap-4 border-b border-border bg-card px-6 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="py-2 text-sm text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 border-t border-border pt-2">
            <Link
              to="/auth?tab=signin"
              className="py-2 text-center text-sm text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              Log in
            </Link>
            <Link
              to="/free-trial"
              className="py-2 text-center text-sm text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              Free trial
            </Link>
            <Link
              to="/auth?tab=create"
              className="rounded-lg bg-[#002D5B] py-2.5 text-center text-sm font-semibold text-white"
              onClick={() => setMenuOpen(false)}
            >
              Start evaluation
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
