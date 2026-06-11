import { ShoppingBag, X } from 'lucide-react'
import { getInstrumentById } from '@/lib/mock/mockInstruments'
import { useEvaluationAccountStore } from '@/store/evaluationAccountStore'
import { useEvaluationTradingStore } from '@/store/evaluationTradingStore'
import { useTradingRoomStore } from '@/store/tradingRoomStore'
import { useTradingPanelTheme } from '@/hooks/useTradingPanelTheme'
import { cn, formatCurrency } from '@/lib/utils'

interface Props {
  accountId: string
  activeInstrumentId: string
  onSelectInstrument: (id: string) => void
}

export default function BasketsTabPanel({
  accountId,
  activeInstrumentId,
  onSelectInstrument,
}: Props) {
  const t = useTradingPanelTheme()
  const account = useEvaluationAccountStore((s) =>
    s.accounts.find((a) => a.id === accountId),
  )
  const baskets = useEvaluationTradingStore((s) => s.getBasketsForAccount(accountId))
  const activeBasket = useEvaluationTradingStore((s) => s.getActiveBasket(accountId))
  const activeBasketId = useEvaluationTradingStore(
    (s) => s.activeBasketByAccount[accountId] ?? null,
  )
  const sizeMode = useEvaluationTradingStore((s) => s.basketSizeMode)
  const createBasket = useEvaluationTradingStore((s) => s.createBasket)
  const setActiveBasket = useEvaluationTradingStore((s) => s.setActiveBasket)
  const addToBasket = useEvaluationTradingStore((s) => s.addToBasket)
  const removeFromBasket = useEvaluationTradingStore((s) => s.removeFromBasket)
  const setBasketSizeMode = useEvaluationTradingStore((s) => s.setBasketSizeMode)
  const placeBasketOrders = useEvaluationTradingStore((s) => s.placeBasketOrders)
  const showToast = useTradingRoomStore((s) => s.showToast)

  const activeInstrument = getInstrumentById(activeInstrumentId)
  const instrumentIds = activeBasket?.instrumentIds ?? []
  const tradableCount = instrumentIds.filter((id) => {
    const inst = getInstrumentById(id)
    return inst && !inst.viewOnly
  }).length

  const marginAvailable =
    Boolean(activeBasket) &&
    instrumentIds.length > 0 &&
    tradableCount > 0 &&
    (account?.freeMargin ?? 0) > 0

  const canAdd =
    Boolean(activeBasket) &&
    activeInstrument &&
    !instrumentIds.includes(activeInstrumentId)

  const canPlace = marginAvailable

  async function handleAdd() {
    if (!activeBasket) {
      await createBasket(accountId)
    }
    await addToBasket(accountId, activeInstrumentId)
  }

  async function handlePlace() {
    const count = await placeBasketOrders(accountId)
    if (count > 0) {
      showToast(`Placed ${count} basket order${count === 1 ? '' : 's'}`)
    } else {
      showToast('No tradable instruments in basket')
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn('space-y-2 border-b px-2 py-2', t.border)}>
        <button
          type="button"
          onClick={() => void createBasket(accountId)}
          className={cn(
            'w-full rounded-lg border border-dashed py-2 text-xs font-medium transition-colors',
            t.dashedBtn,
          )}
        >
          + New
        </button>

        {baskets.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {baskets.map((b) => {
              const active = b.id === activeBasketId
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => void setActiveBasket(accountId, b.id)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors',
                    active ? t.pillActive : t.pillInactive,
                  )}
                >
                  {b.name}
                  {b.instrumentIds.length > 0 && (
                    <span className="ml-1 opacity-70">{b.instrumentIds.length}</span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Size
          </span>
          <div className={cn('inline-flex rounded-full border p-0.5', t.border)}>
            {(['contracts', 'lots'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => void setBasketSizeMode(mode)}
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize transition-colors',
                  sizeMode === mode
                    ? t.pillActive
                    : t.isDark
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-500 hover:text-gray-700',
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <div
          className={cn(
            'flex min-h-[200px] flex-col rounded-xl border border-dashed',
            t.borderDashed,
          )}
        >
          {!activeBasket ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
              <ShoppingBag className={cn('h-8 w-8', t.textFaint)} strokeWidth={1.5} />
              <p className="mt-3 text-sm text-gray-500">No basket selected.</p>
              <p className={cn('mt-1 text-[11px]', t.textFaint)}>
                Tap <span className={t.textMuted}>+ New</span> to create a basket.
              </p>
            </div>
          ) : instrumentIds.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
              <ShoppingBag className={cn('h-8 w-8', t.textFaint)} strokeWidth={1.5} />
              <p className="mt-3 text-sm text-gray-500">No basket selected.</p>
              <p className={cn('mt-1 text-[11px]', t.textFaint)}>
                Use <span className={t.textMuted}>+ Add</span> or search to add instruments.
              </p>
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto p-1">
              {instrumentIds.map((id) => {
                const inst = getInstrumentById(id)
                if (!inst) return null
                return (
                  <li
                    key={id}
                    className={cn(
                      'flex items-center justify-between gap-2 border-b px-2 py-2 last:border-0',
                      t.borderSubtle,
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectInstrument(id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className={cn('truncate text-xs font-semibold', t.textPrimary)}>
                        {inst.displayName}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {inst.symbol}
                        {inst.viewOnly ? ' · View only' : ''}
                      </p>
                    </button>
                    <span className="shrink-0 text-[10px] text-gray-500">
                      1 {sizeMode === 'lots' ? 'lot' : 'contract'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromBasket(accountId, id)}
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border',
                        t.btnBorder,
                      )}
                      aria-label="Remove from basket"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      <div className={cn('flex items-end justify-between gap-2 border-t px-2 py-2.5', t.border)}>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Margin
          </p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                marginAvailable ? 'bg-emerald-500' : 'bg-red-500',
              )}
            />
            <span
              className={cn(
                'text-xs font-medium',
                marginAvailable
                  ? t.isDark
                    ? 'text-emerald-400'
                    : 'text-emerald-600'
                  : t.isDark
                    ? 'text-red-400'
                    : 'text-red-600',
              )}
            >
              {marginAvailable
                ? formatCurrency(account?.freeMargin ?? 0)
                : 'Unavailable'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!canAdd}
            onClick={handleAdd}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors',
              canAdd ? t.btnBorderStrong : cn('cursor-not-allowed', t.btnDisabled),
            )}
          >
            + Add
          </button>
          <button
            type="button"
            disabled={!canPlace}
            onClick={handlePlace}
            className={cn(
              'rounded-lg px-4 py-1.5 text-[11px] font-semibold transition-colors',
              canPlace ? t.placeBtn : cn('cursor-not-allowed', t.placeBtnDisabled),
            )}
          >
            Place
          </button>
        </div>
      </div>
    </div>
  )
}
