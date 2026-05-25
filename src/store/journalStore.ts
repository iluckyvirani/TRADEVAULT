import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface JournalEntry {
  id: string
  orderId?: string
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  date: string
  title: string
  notes: string
  tags: string[]
  rating: 1 | 2 | 3 | 4 | 5
  createdAt: string
  updatedAt: string
}

interface JournalState {
  entries: JournalEntry[]
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateEntry: (id: string, patch: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>) => void
  deleteEntry: (id: string) => void
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      entries: [],

      addEntry: (entry) => {
        const now = new Date().toISOString()
        set((s) => ({
          entries: [
            { ...entry, id: `je-${Date.now()}`, createdAt: now, updatedAt: now },
            ...s.entries,
          ],
        }))
      },

      updateEntry: (id, patch) => {
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e,
          ),
        }))
      },

      deleteEntry: (id) => {
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }))
      },
    }),
    { name: 'tradevault-journal' },
  ),
)
