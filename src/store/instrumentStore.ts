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
  watchlistIds: string[]
  searchOpen: boolean
  setActiveInstrument: (id: string) => { chartSymbol: string; symbol: string; viewOnly: boolean }
  setSearchOpen: (open: boolean) => void
  addToWatchlist: (id: string) => void
  getActiveChartSymbol: () => string
  getActiveInstrument: () => ReturnType<typeof getInstrumentById>
}

export const useInstrumentStore = create<InstrumentStore>()(
  persist(
    (set, get) => ({
      activeInstrumentId: DEFAULT_TRADABLE_INSTRUMENT_ID,
      watchlistIds: [],
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
        set((state) => ({
          watchlistIds: state.watchlistIds.includes(id)
            ? state.watchlistIds
            : [...state.watchlistIds, id],
        })),

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
        watchlistIds: state.watchlistIds,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<InstrumentStore> | undefined
        const id = p?.activeInstrumentId
        if (id === 'idx-nifty') {
          return {
            ...current,
            ...p,
            activeInstrumentId: DEFAULT_TRADABLE_INSTRUMENT_ID,
          }
        }
        return { ...current, ...p }
      },
    },
  ),
)

export const DEFAULT_INSTRUMENT = getDefaultTradableInstrument()
