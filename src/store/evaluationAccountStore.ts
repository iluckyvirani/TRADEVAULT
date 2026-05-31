import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createFreeTrialAccount,
  type EvaluationAccount,
} from '@/lib/mock/mockEvaluationAccounts'

interface EvaluationAccountStore {
  accounts: EvaluationAccount[]
  activeAccountId: string | null
  getAccountsForUser: (userId: string) => EvaluationAccount[]
  setActiveAccount: (id: string) => void
  createFreeTrial: (userId: string) => EvaluationAccount
  hasAccounts: (userId: string) => boolean
}

export const useEvaluationAccountStore = create<EvaluationAccountStore>()(
  persist(
    (set, get) => ({
      accounts: [],
      activeAccountId: null,

      getAccountsForUser: (userId) =>
        get().accounts.filter((a) => a.userId === userId),

      setActiveAccount: (id) => set({ activeAccountId: id }),

      createFreeTrial: (userId) => {
        const account = createFreeTrialAccount(userId)
        set((state) => ({
          accounts: [...state.accounts, account],
          activeAccountId: account.id,
        }))
        return account
      },

      hasAccounts: (userId) =>
        get().accounts.some((a) => a.userId === userId),
    }),
    { name: 'tv-evaluation-accounts' },
  ),
)
