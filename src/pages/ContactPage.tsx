import { useState } from 'react'
import { Inbox, Mail, MessageCircle, Phone, Send } from 'lucide-react'
import {
  CONTACT_INFO,
  FEEDBACK_CATEGORIES,
  type FeedbackCategory,
  type FeedbackSubmission,
} from '@/lib/mock/mockContact'
import { cn } from '@/lib/utils'

const MAX_MESSAGE = 800
const MIN_MESSAGE = 10

export default function ContactPage() {
  const [history, setHistory] = useState<FeedbackSubmission[]>([])
  const [category, setCategory] = useState<FeedbackCategory>('general')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const charsLeft = MAX_MESSAGE - message.length
  const canSend = message.trim().length >= MIN_MESSAGE && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSend) return

    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 400))

    const entry: FeedbackSubmission = {
      id: `fb-${Date.now()}`,
      category,
      message: message.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
    }

    setHistory((prev) => [entry, ...prev])
    setMessage('')
    setSent(true)
    setSubmitting(false)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-7">
      <p className="text-xs text-muted-foreground">Home / Contact</p>

      <h1 className="mt-3 text-3xl font-semibold text-foreground">Contact Us</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell us what&apos;s working, what&apos;s not, and what you&apos;d love to see next.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <ContactCard
          icon={Phone}
          label="Phone"
          value={CONTACT_INFO.phone}
          href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
        />
        <ContactCard
          icon={MessageCircle}
          label="WhatsApp"
          value={CONTACT_INFO.whatsapp}
          href={`https://wa.me/${CONTACT_INFO.whatsapp.replace(/\D/g, '')}`}
        />
        <ContactCard
          icon={Mail}
          label="Email"
          value={CONTACT_INFO.email}
          href={`mailto:${CONTACT_INFO.email}`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold text-foreground">History</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your submissions and their current status.
          </p>

          {history.length === 0 ? (
            <div className="mt-4 flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-4 font-medium text-foreground">No feedback yet</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Your submitted feedback will appear here once you send your first message.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {FEEDBACK_CATEGORIES.find((c) => c.value === item.category)?.label ??
                        item.category}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
                        item.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : item.status === 'in_review'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                      )}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-foreground">{item.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Send feedback</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Share bugs, ideas, or anything you think we should improve.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <label className="block">
              <span className="text-sm font-medium text-foreground">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-[#002D5B]"
              >
                {FEEDBACK_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Message</span>
                <span className="text-xs text-muted-foreground">{charsLeft} left</span>
              </div>
              <textarea
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value.slice(0, MAX_MESSAGE))
                }
                rows={8}
                placeholder="Describe the issue, idea, or feedback..."
                className="mt-1.5 w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#002D5B]"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Minimum {MIN_MESSAGE} characters
              </p>
            </label>

            <div className="mt-5 flex items-center justify-end gap-3">
              {sent && (
                <span className="text-sm text-emerald-600">Feedback sent — thank you!</span>
              )}
              <button
                type="submit"
                disabled={!canSend}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors',
                  canSend
                    ? 'bg-[#002D5B] hover:bg-[#003d7a]'
                    : 'cursor-not-allowed bg-[#5B7FA6]/60',
                )}
              >
                <Send className="h-4 w-4" />
                Send feedback
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Phone
  label: string
  value: string
  href: string
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </a>
  )
}
