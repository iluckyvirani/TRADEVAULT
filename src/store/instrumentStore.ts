import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  DEFAULT_TRADABLE_INSTRUMENT_ID,
  getChartSymbol,
  getInstrumentById,
  getDefaultTradableInstrument,
} from '@/lib/mock/mockInstruments'

interface InstrumentStore {
  activeInstrumentId: string
  /** @deprecated Migrated to watchlists — kept for persist merge */
  watchlistIds?: string[]
  watchlists: Record<string, string[]>
  activeWatchlistId: string
  searchOpen: boolean
  setActiveInstrument: (id: string) => { chartSymbol: string; symbol: string; viewOnly: boolean }
  setSearchOpen: (open: boolean) => void
  addToWatchlist: (id: string) => void
  removeFromWatchlist: (id: string) => void
  clearActiveWatchlist: () => void
  setActiveWatchlist: (listId: string) => void
  addWatchlist: () => string
  getActiveWatchlistIds: () => string[]
  getActiveChartSymbol: () => string
  getActiveInstrument: () => ReturnType<typeof getInstrumentById>
}

const DEFAULT_WATCHLISTS: Record<string, string[]> = { '1': [], '2': [] }

export const useInstrumentStore = create<InstrumentStore>()(
  persist(
    (set, get) => ({
      activeInstrumentId: DEFAULT_TRADABLE_INSTRUMENT_ID,
      watchlists: { ...DEFAULT_WATCHLISTS },
      activeWatchlistId: '1',
      searchOpen: false,

      setActiveInstrument: (id) => {
        const instrument = getInstrumentById(id)
        if (!instrument) {
          return { chartSymbol: 'NIFTY', symbol: 'NIFTY', viewOnly: true }
        }
        set({ activeInstrumentId: id })
        const chartSymbol = getChartSymbol(instrument)
        return {
          chartSymbol,
          symbol: instrument.symbol,
          viewOnly: instrument.viewOnly,
        }
      },

      setSearchOpen: (open) => set({ searchOpen: open }),

      addToWatchlist: (id) =>
        set((state) => {
          const listId = state.activeWatchlistId
          const current = state.watchlists[listId] ?? []
          if (current.includes(id)) return state
          return {
            watchlists: {
              ...state.watchlists,
              [listId]: [...current, id],
            },
          }
        }),

      removeFromWatchlist: (id) =>
        set((state) => {
          const listId = state.activeWatchlistId
          const current = state.watchlists[listId] ?? []
          return {
            watchlists: {
              ...state.watchlists,
              [listId]: current.filter((x) => x !== id),
            },
          }
        }),

      clearActiveWatchlist: () =>
        set((state) => ({
          watchlists: {
            ...state.watchlists,
            [state.activeWatchlistId]: [],
          },
        })),

      setActiveWatchlist: (listId) => set({ activeWatchlistId: listId }),

      addWatchlist: () => {
        const ids = Object.keys(get().watchlists)
        const next = String(Math.max(0, ...ids.map(Number)) + 1)
        set((state) => ({
          watchlists: { ...state.watchlists, [next]: [] },
          activeWatchlistId: next,
        }))
        return next
      },

      getActiveWatchlistIds: () => {
        const { activeWatchlistId, watchlists } = get()
        return watchlists[activeWatchlistId] ?? []
      },

      getActiveChartSymbol: () => {
        const instrument = getInstrumentById(get().activeInstrumentId)
        return instrument ? getChartSymbol(instrument) : 'NIFTY'
      },

      getActiveInstrument: () => getInstrumentById(get().activeInstrumentId),
    }),
    {
      name: 'tv-instruments',
      partialize: (state) => ({
        activeInstrumentId: state.activeInstrumentId,
        watchlists: state.watchlists,
        activeWatchlistId: state.activeWatchlistId,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<InstrumentStore> | undefined
        const id = p?.activeInstrumentId
        const legacyIds = p?.watchlistIds
        const watchlists =
          p?.watchlists ??
          (legacyIds?.length
            ? { ...DEFAULT_WATCHLISTS, '1': legacyIds }
            : current.watchlists)

        const base = {
          ...current,
          ...p,
          watchlists,
          activeWatchlistId: p?.activeWatchlistId ?? '1',
        }

        if (id === 'idx-nifty') {
          return { ...base, activeInstrumentId: DEFAULT_TRADABLE_INSTRUMENT_ID }
        }
        return base
      },
    },
  ),
)

export const DEFAULT_INSTRUMENT = getDefaultTradableInstrument()
