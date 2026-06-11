import { useEffect, useRef, useState } from 'react'
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
} from 'lightweight-charts'
import type { IChartApi, UTCTimestamp } from 'lightweight-charts'
import { mockCandles, mockQuotes } from '@/lib/mock'
import { fetchCandles } from '@/lib/api/market'
import type { Candle } from '@/lib/mock/mockCandles'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useThemeStore } from '@/store/themeStore'
import { cn, formatCurrency } from '@/lib/utils'
import {
  BarChart2,
  CandlestickChart,
  LineChart,
  AreaChart,
  Search,
  Settings2,
  Camera,
  Plus,
  Minus,
  Move,
  PencilLine,
  Ruler,
  Type,
  Smile,
  Magnet,
  Lock,
  Eye,
  Crosshair,
  Undo2,
  Redo2,
} from 'lucide-react'

type TimeFrame = '5D' | '1M' | '3M' | '6M' | '1Y'
type ChartType = 'candlestick' | 'line' | 'area'

const TF_DAYS: Record<TimeFrame, number> = {
  '5D': 5,
  '1M': 21,
  '3M': 63,
  '6M': 126,
  '1Y': 252,
}

const SYMBOLS = Object.keys(mockQuotes)

const UP_COLOR = '#10B981'
const DOWN_COLOR = '#EF4444'
const PRIMARY = '#6366F1'

interface Props {
  activeSymbol?: string
  onSymbolChange?: (symbol: string) => void
  variant?: 'default' | 'terminal'
  symbolLabel?: string
  onOpenSymbolSearch?: () => void
}

export function ChartPanel({
  activeSymbol,
  onSymbolChange,
  variant = 'default',
  symbolLabel,
  onOpenSymbolSearch,
}: Props) {
  const terminal = variant === 'terminal'
  const isDark = useThemeStore((s) => s.mode === 'dark')
  const terminalDark = terminal && isDark
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  const [symbol, setSymbol] = useState(activeSymbol ?? 'RELIANCE')
  const [timeframe, setTimeframe] = useState<TimeFrame>('3M')
  const [chartType, setChartType] = useState<ChartType>('candlestick')
  const [showMA20, setShowMA20] = useState(true)
  const [showMA50, setShowMA50] = useState(true)
  const [showChart, setShowChart] = useState(true)
  const [candles, setCandles] = useState<Candle[]>([])
  const [candleInterval, setCandleInterval] = useState('1d')

  const liveQuotes = usePortfolioStore((s) => s.liveQuotes)
  const quote = liveQuotes[symbol]

  const isIntraday = terminal && timeframe === '1M'

  useEffect(() => {
    let cancelled = false
    const interval = isIntraday ? '1m' : '1d'
    const limit = isIntraday ? 390 : TF_DAYS[timeframe]

    void fetchCandles(symbol, { interval, limit })
      .then((res) => {
        if (cancelled) return
        const data =
          res.candles.length > 0
            ? res.candles
            : (mockCandles[symbol] ?? []).slice(-limit)
        setCandles(data)
        setCandleInterval(interval)
      })
      .catch(() => {
        if (!cancelled) {
          setCandles((mockCandles[symbol] ?? []).slice(-limit))
          setCandleInterval(interval)
        }
      })

    return () => {
      cancelled = true
    }
  }, [symbol, timeframe, isIntraday])

  // Sync controlled prop
  useEffect(() => {
    if (activeSymbol && activeSymbol !== symbol) setSymbol(activeSymbol)
  }, [activeSymbol, symbol])

  // Build/rebuild chart whenever key params change
  useEffect(() => {
    if (!showChart) return
    const container = containerRef.current
    if (!container) return

    // Remove previous chart
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }

    const chart = createChart(container, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#94A3B8',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#1E293B' },
        horzLines: { color: '#1E293B' },
      },
      rightPriceScale: {
        borderColor: '#1E293B',
        scaleMargins: { top: 0.1, bottom: 0.15 },
      },
      timeScale: {
        borderColor: '#1E293B',
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      crosshair: {
        vertLine: { color: PRIMARY, labelBackgroundColor: PRIMARY },
        horzLine: { color: PRIMARY, labelBackgroundColor: PRIMARY },
      },
      width: container.clientWidth,
      height: container.clientHeight || 380,
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    })

    chartRef.current = chart

    if (candles.length === 0) return

    // Main series
    if (chartType === 'candlestick') {
      const s = chart.addSeries(CandlestickSeries, {
        upColor: UP_COLOR,
        downColor: DOWN_COLOR,
        borderUpColor: UP_COLOR,
        borderDownColor: DOWN_COLOR,
        wickUpColor: UP_COLOR,
        wickDownColor: DOWN_COLOR,
      })
      s.setData(
        candles.map((c) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        })),
      )
    } else if (chartType === 'line') {
      const s = chart.addSeries(LineSeries, {
        color: PRIMARY,
        lineWidth: 2,
        lastValueVisible: true,
        priceLineVisible: true,
      })
      s.setData(candles.map((c) => ({ time: c.time as UTCTimestamp, value: c.close })))
    } else {
      const s = chart.addSeries(AreaSeries, {
        topColor: 'rgba(99,102,241,0.28)',
        bottomColor: 'rgba(99,102,241,0.02)',
        lineColor: PRIMARY,
        lineWidth: 2,
      })
      s.setData(candles.map((c) => ({ time: c.time as UTCTimestamp, value: c.close })))
    }

    // MA 20
    if (showMA20 && candles.length >= 20) {
      const ma20 = chart.addSeries(LineSeries, {
        color: '#F59E0B',
        lineWidth: 1,
        lastValueVisible: false,
        priceLineVisible: false,
      })
      ma20.setData(
        candles
          .map((_, i): { time: UTCTimestamp; value: number } | null =>
            i < 19
              ? null
              : {
                  time: candles[i].time as UTCTimestamp,
                  value: parseFloat(
                    (candles.slice(i - 19, i + 1).reduce((s, c) => s + c.close, 0) / 20).toFixed(2),
                  ),
                },
          )
          .filter((d): d is { time: UTCTimestamp; value: number } => d !== null),
      )
    }

    // MA 50
    if (showMA50 && candles.length >= 50) {
      const ma50 = chart.addSeries(LineSeries, {
        color: '#A855F7',
        lineWidth: 1,
        lastValueVisible: false,
        priceLineVisible: false,
      })
      ma50.setData(
        candles
          .map((_, i): { time: UTCTimestamp; value: number } | null =>
            i < 49
              ? null
              : {
                  time: candles[i].time as UTCTimestamp,
                  value: parseFloat(
                    (candles.slice(i - 49, i + 1).reduce((s, c) => s + c.close, 0) / 50).toFixed(2),
                  ),
                },
          )
          .filter((d): d is { time: UTCTimestamp; value: number } => d !== null),
      )
    }

    chart.timeScale().fitContent()

    // Responsive resize
    const ro = new ResizeObserver(() => {
      if (container && chartRef.current) {
        chartRef.current.applyOptions({ width: container.clientWidth })
      }
    })
    ro.observe(container)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
    }
  }, [candles, chartType, showMA20, showMA50, showChart])

  function handleSymbolChange(sym: string) {
    setSymbol(sym)
    onSymbolChange?.(sym)
  }

  const up = (quote?.changePct ?? 0) >= 0

  const toolbarBtnCls = cn(
    'inline-flex h-7 shrink-0 items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors',
    terminalDark
      ? 'border-white/10 bg-[#0d1016] text-gray-300 hover:bg-white/5 hover:text-white'
      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900',
  )

  return (
    <div
      className={cn(
        'flex h-full flex-col',
        terminal
          ? terminalDark
            ? 'border-0 bg-[#0f1115]'
            : 'border-0 bg-white'
          : 'rounded-2xl border border-border bg-card',
      )}
    >
      {/* Top toolbar */}
      <div
        className={cn(
          'flex items-center gap-2 border-b px-3 py-2',
          terminal ? 'flex-nowrap overflow-x-auto' : 'flex-wrap',
          terminalDark ? 'border-white/10' : terminal ? 'border-gray-200' : 'border-border',
        )}
      >
        {terminal ? (
          <>
            <button
              type="button"
              onClick={() => onOpenSymbolSearch?.()}
              className={cn(toolbarBtnCls, 'w-[122px] justify-start gap-1.5 text-[11px] font-semibold')}
            >
              <Search className="h-3.5 w-3.5" />
              <span className="truncate">{symbolLabel ?? symbol}</span>
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('1M')}
              className={cn(
                toolbarBtnCls,
                'w-10 px-0',
                timeframe === '1M' &&
                  (terminalDark
                    ? 'border-white/30 bg-white/10 text-white'
                    : 'border-gray-300 bg-gray-100 text-gray-900'),
              )}
            >
              1m
            </button>
            <button type="button" className={cn(toolbarBtnCls, 'w-7 px-0')}>
              <CandlestickChart className="h-3.5 w-3.5" />
            </button>
            <button type="button" className={cn(toolbarBtnCls, 'w-7 px-0')}>
              <BarChart2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMA20((v) => !v)
                setShowMA50((v) => !v)
              }}
              className={cn(toolbarBtnCls, 'px-2.5')}
            >
              Indicators
            </button>
            <button type="button" className={cn(toolbarBtnCls, 'w-7 px-0')}>
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button type="button" className={cn(toolbarBtnCls, 'w-7 px-0')}>
              <Redo2 className="h-3.5 w-3.5" />
            </button>
            <div className="flex-1" />
            <button type="button" className={cn(toolbarBtnCls, 'px-2')}>
              Save
            </button>
            <button type="button" className={cn(toolbarBtnCls, 'w-7 px-0')}>
              <Settings2 className="h-3.5 w-3.5" />
            </button>
            <button type="button" className={cn(toolbarBtnCls, 'w-7 px-0')}>
              <Camera className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <>
            {/* Symbol selector */}
            <select
              value={symbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              className={cn(
                'rounded-lg border px-2 py-1 text-sm font-mono font-bold outline-none focus:border-primary',
                terminalDark
                  ? 'border-white/10 bg-black/40 text-white'
                  : terminal
                    ? 'border-gray-200 bg-gray-50 text-gray-900'
                    : 'border-border bg-background text-foreground',
              )}
            >
              {SYMBOLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Live price */}
            {quote && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{formatCurrency(quote.price)}</span>
                <span className={cn('text-xs font-semibold', up ? 'text-accent' : 'text-destructive')}>
                  {up ? '+' : ''}
                  {quote.changePct.toFixed(2)}%
                </span>
              </div>
            )}

            <div className="flex-1" />

            {/* Chart type */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(
                [
                  { type: 'candlestick' as ChartType, icon: CandlestickChart, label: 'Candle' },
                  { type: 'line' as ChartType, icon: LineChart, label: 'Line' },
                  { type: 'area' as ChartType, icon: AreaChart, label: 'Area' },
                ] as const
              ).map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  title={label}
                  onClick={() => setChartType(type)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 text-xs transition-colors',
                    chartType === type
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>

            {/* Indicators */}
            <button
              onClick={() => setShowMA20((v) => !v)}
              className={cn(
                'rounded-lg border px-2 py-1 text-xs font-semibold transition-all',
                showMA20
                  ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
                  : 'border-border text-muted-foreground',
              )}
            >
              MA20
            </button>
            <button
              onClick={() => setShowMA50((v) => !v)}
              className={cn(
                'rounded-lg border px-2 py-1 text-xs font-semibold transition-all',
                showMA50
                  ? 'border-purple-500/50 bg-purple-500/10 text-purple-400'
                  : 'border-border text-muted-foreground',
              )}
            >
              MA50
            </button>

            {/* Timeframes */}
            <div className="flex gap-0.5">
              {(['5D', '1M', '3M', '6M', '1Y'] as TimeFrame[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={cn(
                    'rounded px-2 py-1 text-xs font-medium transition-all',
                    timeframe === tf
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        {terminal && (
          <div
            className={cn(
              'flex w-10 flex-col items-center gap-2 border-r py-2',
              terminalDark ? 'border-white/10 bg-[#0c0f14]' : 'border-gray-200 bg-white',
            )}
          >
            {[
              Plus,
              Minus,
              Move,
              PencilLine,
              Ruler,
              Type,
              Smile,
              Magnet,
              Lock,
              Eye,
              Crosshair,
            ].map((Icon, idx) => (
              <button
                key={idx}
                type="button"
                className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded border transition-colors',
                  terminalDark
                    ? 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        )}
        {showChart ? (
          <div ref={containerRef} className="min-h-0 flex-1" />
        ) : (
          <div
            className={cn(
              'flex min-h-0 flex-1 items-center justify-center text-xs',
              terminalDark ? 'text-gray-500' : 'text-gray-400',
            )}
          >
            Chart hidden
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        className={cn(
          'flex items-center gap-4 border-t px-4 py-2 text-[10px]',
          terminalDark
            ? 'border-white/10 text-gray-500'
            : terminal
              ? 'border-gray-200 text-gray-400'
              : 'border-border text-muted-foreground',
        )}
      >
        <BarChart2 className="h-3 w-3 text-primary" />
        <span>
          {candles.length > 0 ? 'API data' : 'Loading'} · {candleInterval === '1m' ? '1m' : 'Daily'} OHLCV
        </span>
        {showMA20 && <span className="text-yellow-400">● MA 20</span>}
        {showMA50 && <span className="text-purple-400">● MA 50</span>}
        {terminal && (
          <button
            type="button"
            onClick={() => setShowChart((v) => !v)}
            className={cn(
              'ml-auto rounded border px-2 py-1 text-[10px] transition-colors',
              terminalDark
                ? 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900',
            )}
          >
            {showChart ? 'Hide chart' : 'Show chart'}
          </button>
        )}
      </div>
    </div>
  )
}
