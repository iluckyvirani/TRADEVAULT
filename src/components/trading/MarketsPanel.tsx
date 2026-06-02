import { Plus } from 'lucide-react'
import { useEvaluationTradingStore } from '@/store/evaluationTradingStore'
import { useTradingRoomStore, type RoomTab } from '@/store/tradingRoomStore'
import { useThemeStore } from '@/store/themeStore'
import TradingRoomTabContent from '@/components/trading/TradingRoomTabContent'
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
  const isDark = useThemeStore((s) => s.mode === 'dark')
  const activeTab = useTradingRoomStore((s) => s.activeTab)
  const setActiveTab = useTradingRoomStore((s) => s.setActiveTab)
  const ordersLen = useEvaluationTradingStore(
    (s) => s.orders.filter((o) => o.accountId === accountId).length,
  )

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r',
        isDark ? 'border-white/10 bg-[#0f1115]' : 'border-gray-200 bg-white',
      )}
    >
      <div className={cn('border-b px-3 py-2.5', isDark ? 'border-white/10' : 'border-gray-200')}>
        <p
          className={cn(
            'text-[10px] font-semibold uppercase tracking-wider',
            isDark ? 'text-gray-500' : 'text-gray-400',
          )}
        >
          Markets
        </p>
        <p className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
          {instrumentLabel}
        </p>
      </div>

      <div className={cn('flex border-b', isDark ? 'border-white/10' : 'border-gray-200')}>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              'relative flex-1 py-2 text-[11px] font-medium transition-colors',
              activeTab === id
                ? isDark
                  ? 'border-b-2 border-blue-500 text-white'
                  : 'border-b-2 border-[#002D5B] text-[#002D5B]'
                : isDark
                  ? 'text-gray-500 hover:text-gray-300'
                  : 'text-gray-400 hover:text-gray-700',
            )}
          >
            {label}
            {id === 'orders' && ordersLen > 0 && (
              <span className="ml-0.5 text-[9px] text-blue-400">({ordersLen})</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab === 'watch' && (
          <button
            type="button"
            onClick={onOpenSearch}
            className={cn(
              'mx-2 mt-2 flex flex-shrink-0 items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-xs font-medium',
              isDark
                ? 'border-white/15 text-gray-400 hover:text-white'
                : 'border-gray-300 text-gray-500',
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            Add symbol
          </button>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <TradingRoomTabContent
            accountId={accountId}
            tab={activeTab}
            onSelectInstrument={onSelectInstrument}
            onOpenSearch={onOpenSearch}
          />
        </div>
      </div>
    </div>
  )
}
