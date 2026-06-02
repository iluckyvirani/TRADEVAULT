import { useMemo, useState } from 'react'
import { Check, ChevronDown, Crown, SlidersHorizontal } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useEvaluationAccountStore } from '@/store/evaluationAccountStore'
import { cn, formatCurrency, formatCurrencyWhole } from '@/lib/utils'

export default function AccountsListPage() {
  const user = useAuthStore((s) => s.user)
  const allAccounts = useEvaluationAccountStore((s) => s.accounts)

  const accounts = useMemo(
    () => (user ? allAccounts.filter((a) => a.userId === user.id) : []),
    [allAccounts, user?.id],
  )

  const [masterAccountId, setMasterAccountId] = useState<string | null>(
    accounts[0]?.id ?? null,
  )
  const [openSelector, setOpenSelector] = useState(false)
  const [flattenOn, setFlattenOn] = useState(false)

  const master = accounts.find((a) => a.id === masterAccountId) ?? null
  const todayPnl = master?.todayPnL ?? 0
  const totalPnl = master?.unrealizedPnL ?? 0

  const titleCls = 'text-foreground'
  const subCls = 'text-muted-foreground'
  const cardCls = 'border-border bg-card'
  const rowCls = 'border-border'

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-7">
      <h1 className={cn('text-[34px] font-semibold leading-tight', titleCls)}>Account Manager</h1>
      <p className={cn('mt-1 text-sm', subCls)}>
        Live copier control with master-first routing and compact loss buffers.
      </p>

      <section className={cn('mt-4 rounded-xl border', cardCls)}>
        <div className="grid grid-cols-1 sm:grid-cols-3">
          <StatCard
            label="Today's P&L"
            value={todayPnl}
            rowClass={rowCls}
          />
          <StatCard
            label="Total P&L"
            value={totalPnl}
            rowClass={rowCls}
          />
          <div className={cn('flex items-center justify-between px-4 py-3 sm:border-l', rowCls)}>
            <div>
              <p className={cn('text-[10px] font-medium uppercase tracking-wider', subCls)}>
                Active Accounts
              </p>
              <p className={cn('mt-1 text-xl font-bold', titleCls)}>{accounts.length}</p>
            </div>
            <SlidersHorizontal className={cn('h-4 w-4', subCls)} />
          </div>
        </div>
      </section>

      <p className={cn('mt-2 text-xs', subCls)}>
        Live copier data refreshes continuously while this page is open.
      </p>

      <section className={cn('mt-3 rounded-xl border', cardCls)}>
        <div className={cn('flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5', rowCls)}>
          <div>
            <p className={cn('text-base font-semibold', titleCls)}>Trade copier setup</p>
            <p className={cn('mt-0.5 text-xs', subCls)}>
              Selections sync automatically. Master changes lock while current master has open positions.
            </p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenSelector((v) => !v)}
              className={cn(
                'flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground',
              )}
            >
              <span className="text-xs text-muted-foreground">
                {master ? master.id.slice(0, 18) + '…' : 'Select master account'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {openSelector && (
              <div
                className={cn(
                  'absolute right-0 z-10 mt-1 w-72 rounded-lg border border-border bg-card shadow-lg',
                )}
              >
                <p className={cn('px-3 py-2 text-[10px] font-semibold uppercase tracking-wider', subCls)}>
                  Select Master Account
                </p>
                {accounts.length === 0 ? (
                  <p className={cn('px-3 pb-3 text-xs', subCls)}>No accounts found</p>
                ) : (
                  accounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        setMasterAccountId(acc.id)
                        setOpenSelector(false)
                      }}
                      className={cn(
                        'block w-full px-3 py-2 text-left text-sm hover:bg-muted',
                        masterAccountId === acc.id && 'font-semibold',
                      )}
                    >
                      <p className={titleCls}>{acc.id}</p>
                      <p className={cn('text-xs', subCls)}>
                        Equity {formatCurrency(acc.equity)} · {acc.todayPnL >= 0 ? '+' : ''}
                        {formatCurrency(acc.todayPnL)} today
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className={cn('grid grid-cols-[2.2fr_1fr_1fr_1.2fr_1.2fr_0.8fr_0.8fr] border-b px-4 py-2 text-[10px] font-semibold uppercase tracking-wider', rowCls, subCls)}>
          <p>Account</p>
          <p>Equity</p>
          <p>Today</p>
          <p>Daily PnL Stop</p>
          <p>Buffer Limits</p>
          <p>Positions</p>
          <p>Updated</p>
        </div>

        <div className="px-4 py-4">
          {master ? (
            <div className={cn('grid grid-cols-[2.2fr_1fr_1fr_1.2fr_1.2fr_0.8fr_0.8fr] items-center gap-2 rounded-lg border p-3', rowCls)}>
              <div>
                <p className={cn('flex items-center gap-2 text-sm font-semibold', titleCls)}>
                  <Crown className="h-4 w-4 text-amber-500" />
                  {master.id}
                </p>
                <p className={cn('mt-1 text-xs', subCls)}>
                  {formatCurrencyWhole(master.accountSize)} account
                </p>
                <span className="mt-1 inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                  {master.stepType}
                </span>
              </div>
              <p className={cn('font-semibold', titleCls)}>{formatCurrency(master.equity)}</p>
              <p className={cn('font-semibold', master.todayPnL < 0 ? 'text-red-500' : 'text-green-500')}>
                {master.todayPnL >= 0 ? '+' : ''}
                {formatCurrency(master.todayPnL)}
              </p>
              <p className={cn('text-xs', subCls)}>-{formatCurrency(master.dailyMaxLoss)}</p>
              <div className="text-xs">
                <p className="font-semibold text-emerald-600">
                  DAILY {formatCurrency(master.equity - (master.accountSize - master.dailyMaxLoss))} left
                </p>
                <p className="font-semibold text-green-600">
                  MAX {formatCurrency(master.equity - (master.accountSize - master.maxLoss))} left
                </p>
              </div>
              <p className={cn('text-sm', titleCls)}>{flattenOn ? 0 : 1}</p>
              <p className={cn('text-xs', subCls)}>
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ) : (
            <p className={cn('py-6 text-center text-sm', subCls)}>
              Use the master account selector above to start a copier setup.
            </p>
          )}
        </div>

        <div className={cn('flex items-center justify-between border-t px-4 py-2', rowCls)}>
          <p className={cn('text-[10px] font-semibold uppercase tracking-wider', subCls)}>
            Follower Accounts
          </p>
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => setFlattenOn((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-1',
                flattenOn ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700',
              )}
            >
              <Check className="h-3 w-3" />
              {flattenOn ? 'Flatten' : 'Synced'}
            </button>
            <span className={subCls}>0 selected</span>
          </div>
        </div>
        <p className={cn('px-4 py-5 text-center text-sm', subCls)}>
          Select a master account to see eligible followers.
        </p>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  rowClass,
}: {
  label: string
  value: number
  rowClass: string
}) {
  const text =
    value < 0 ? 'text-red-500' : value > 0 ? 'text-green-500' : 'text-foreground'
  return (
    <div className={cn('px-4 py-3 sm:border-r', rowClass)}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn('mt-1 text-2xl font-bold', text)}>
        {value > 0 ? '+' : ''}
        {formatCurrency(value)}
      </p>
    </div>
  )
}
