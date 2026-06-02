import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createFreeTrialAccount,
  createPaidAccount,
  type EvaluationAccount,
  type FreeTrialOptions,
  type PaidAccountOptions,
} from '@/lib/mock/mockEvaluationAccounts'

interface EvaluationAccountStore {
  accounts: EvaluationAccount[]
  activeAccountId: string | null
  getAccountsForUser: (userId: string) => EvaluationAccount[]
  setActiveAccount: (id: string) => void
  createFreeTrial: (userId: string, options?: FreeTrialOptions) => EvaluationAccount
  createPaid: (userId: string, options: PaidAccountOptions) => EvaluationAccount
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

      createFreeTrial: (userId, options) => {
        const account = createFreeTrialAccount(userId, options)
        set((state) => ({
          accounts: [...state.accounts, account],
          activeAccountId: account.id,
        }))
        return account
      },

      createPaid: (userId, options) => {
        const account = createPaidAccount(userId, options)
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
