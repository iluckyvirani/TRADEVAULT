import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award } from 'lucide-react'
import {
  countByCategory,
  filterCertificates,
  mockCertificates,
  type CertificateCategory,
} from '@/lib/mock/mockCertificates'
import { cn } from '@/lib/utils'

type FilterTab = 'all' | CertificateCategory

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'evaluation', label: 'Evaluation' },
  { id: 'funded', label: 'Funded' },
  { id: 'milestone', label: 'Milestones' },
]

export default function CertificatesPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const filtered = useMemo(
    () => filterCertificates(mockCertificates, activeTab),
    [activeTab],
  )

  const totalCount = mockCertificates.length

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6 lg:p-7">
      <p className="text-xs text-muted-foreground">Home / Certificates</p>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">My Certificates</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Verified achievements across evaluations, funded status, and payout milestones.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{totalCount}</span> total
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map(({ id, label }) => {
          const count = countByCategory(mockCertificates, id)
          const active = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                active
                  ? 'border-[#002D5B] bg-[#002D5B] text-white'
                  : 'border-border bg-card text-foreground hover:bg-muted',
              )}
            >
              {label}
              <span
                className={cn(
                  'min-w-[1.25rem] rounded-full px-1.5 text-center text-xs font-semibold',
                  active ? 'text-white/90' : 'text-muted-foreground',
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map((cert) => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </ul>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef3fa] dark:bg-[#1a2a3d]">
        <Award className="h-7 w-7 text-[#0a4f84] dark:text-[#6b9fd4]" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-foreground">No certificates issued yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Successfully complete an evaluation to earn a verified trading certificate that
        demonstrates discipline, consistency, and risk management.
      </p>
      <Link
        to="/evaluation"
        className="mt-6 inline-flex items-center justify-center rounded-lg border border-[#002D5B] bg-card px-6 py-2.5 text-sm font-semibold text-[#002D5B] transition-colors hover:bg-muted dark:border-[#4a7ab8] dark:text-[#8bb4e8]"
      >
        Start Evaluation
      </Link>
    </div>
  )
}

function CertificateCard({
  certificate,
}: {
  certificate: (typeof mockCertificates)[number]
}) {
  const categoryLabel =
    certificate.category === 'evaluation'
      ? 'Evaluation'
      : certificate.category === 'funded'
        ? 'Funded'
        : 'Milestone'

  return (
    <li className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#eef3fa] dark:bg-[#1a2a3d]">
          <Award className="h-5 w-5 text-[#0a4f84] dark:text-[#6b9fd4]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#0a4f84] dark:text-[#6b9fd4]">
            {categoryLabel}
          </p>
          <h3 className="mt-0.5 truncate font-semibold text-foreground">{certificate.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{certificate.programLabel}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Issued {new Date(certificate.issuedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </li>
  )
}
