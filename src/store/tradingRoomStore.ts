import { create } from 'zustand'

export type RoomTab = 'watch' | 'baskets' | 'orders' | 'positions'

interface TradingRoomStore {
  activeTab: RoomTab
  setActiveTab: (tab: RoomTab) => void
  toast: string | null
  showToast: (msg: string) => void
  clearToast: () => void
}

export const useTradingRoomStore = create<TradingRoomStore>((set) => ({
  activeTab: 'watch',
  setActiveTab: (tab) => set({ activeTab: tab }),
  toast: null,
  showToast: (msg) => {
    set({ toast: msg })
    setTimeout(() => set({ toast: null }), 3500)
  },
  clearToast: () => set({ toast: null }),
}))
