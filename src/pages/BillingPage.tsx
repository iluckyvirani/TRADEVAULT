import { Loader2 } from 'lucide-react'
import { useBilling } from '@/hooks/useBilling'
import { cn, formatCurrency } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  refunded: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

export default function BillingPage() {
  const { records, loading, error } = useBilling()

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6 lg:p-7">
      <p className="text-xs text-muted-foreground">Home / Billing</p>

      <h1 className="mt-3 text-3xl font-semibold text-foreground">Billing History</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        View and manage your evaluation payment records.
      </p>

      {loading ? (
        <div className="mt-8 flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : records.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-20 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            No billing history yet. Your payments will appear here once you make a purchase.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Method</th>
                </tr>
              </thead>
              <tbody>
                {records.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">
                      {new Date(row.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {row.program}
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {formatCurrency(row.accountSize)} account
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
                          STATUS_STYLES[row.status],
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.paymentMethod ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
