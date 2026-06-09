import { useEvaluationTradingStore } from '@/store/evaluationTradingStore'
import { useInstrumentStore } from '@/store/instrumentStore'
import { useTradingRoomStore, type RoomTab } from '@/store/tradingRoomStore'
import BasketsTabPanel from '@/components/trading/BasketsTabPanel'
import OrdersTabPanel from '@/components/trading/OrdersTabPanel'
import PositionsTabPanel from '@/components/trading/PositionsTabPanel'
import WatchTabPanel from '@/components/trading/WatchTabPanel'
import { useTradingPanelTheme } from '@/hooks/useTradingPanelTheme'
import { cn } from '@/lib/utils'

interface Props {
  accountId: string
  instrumentLabel?: string
  onOpenSearch: () => void
  onSelectInstrument: (id: string) => void
}

const TABS: { id: RoomTab; label: string }[] = [
  { id: 'watch', label: 'Watch' },
  { id: 'baskets', label: 'Baskets' },
  { id: 'orders', label: 'Orders' },
  { id: 'positions', label: 'Positions' },
]

export default function MarketsPanel({
  accountId,
  instrumentLabel = 'Nifty 50',
  onOpenSearch,
  onSelectInstrument,
}: Props) {
  const t = useTradingPanelTheme()
  const activeTab = useTradingRoomStore((s) => s.activeTab)
  const setActiveTab = useTradingRoomStore((s) => s.setActiveTab)
  const activeInstrumentId = useInstrumentStore((s) => s.activeInstrumentId)
  const ordersLen = useEvaluationTradingStore(
    (s) => s.orders.filter((o) => o.accountId === accountId).length,
  )

  return (
    <div className={cn('flex h-full flex-col border-r', t.border, t.panelBg, t.textPrimary)}>
      <div className={cn('border-b px-3 py-3', t.border)}>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Markets
        </p>
        <p className={cn('mt-0.5 truncate text-base font-bold', t.textPrimary)}>
          {instrumentLabel}
        </p>
      </div>

      <div className="px-2 pt-2">
        <div className={cn('flex rounded-xl border p-0.5', t.border)}>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'relative flex-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors',
                activeTab === id ? t.tabActive : t.tabInactive,
              )}
            >
              {label}
              {id === 'orders' && ordersLen > 0 && (
                <span className="ml-0.5 text-[9px] text-blue-400">({ordersLen})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab === 'watch' ? (
          <WatchTabPanel
            activeInstrumentId={activeInstrumentId}
            onOpenSearch={onOpenSearch}
            onSelectInstrument={onSelectInstrument}
          />
        ) : activeTab === 'baskets' ? (
          <BasketsTabPanel
            accountId={accountId}
            activeInstrumentId={activeInstrumentId}
            onSelectInstrument={onSelectInstrument}
          />
        ) : activeTab === 'orders' ? (
          <OrdersTabPanel accountId={accountId} />
        ) : (
          <PositionsTabPanel accountId={accountId} />
        )}
      </div>
    </div>
  )
}
