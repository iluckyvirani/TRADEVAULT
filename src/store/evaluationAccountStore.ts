import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as accountsApi from '@/lib/api/accounts'
import type {
  EvaluationAccount,
  PaidAccountOptions,
} from '@/lib/mock/mockEvaluationAccounts'

interface EvaluationAccountStore {
  accounts: EvaluationAccount[]
  activeAccountId: string | null
  accountsReady: boolean
  hydrateAccounts: () => Promise<void>
  getAccountsForUser: (userId: string) => EvaluationAccount[]
  setActiveAccount: (id: string) => void
  createFreeTrial: (accountSize: number) => Promise<EvaluationAccount>
  createPaid: (options: PaidAccountOptions) => Promise<EvaluationAccount>
  hasAccounts: (userId: string) => boolean
  upsertAccount: (account: EvaluationAccount) => void
}

export const useEvaluationAccountStore = create<EvaluationAccountStore>()(
  persist(
    (set, get) => ({
      accounts: [],
      activeAccountId: null,
      accountsReady: false,

      hydrateAccounts: async () => {
        try {
          const { accounts } = await accountsApi.fetchAccounts()
          const prevActive = get().activeAccountId
          const activeAccountId =
            prevActive && accounts.some((a) => a.id === prevActive)
              ? prevActive
              : accounts[0]?.id ?? null

          set({ accounts, activeAccountId, accountsReady: true })
        } catch {
          set({ accountsReady: true })
        }
      },

      getAccountsForUser: (userId) =>
        get().accounts.filter((a) => a.userId === userId),

      setActiveAccount: (id) => {
        set({ activeAccountId: id })
        accountsApi.setActiveAccount(id).catch(() => {})
      },

      createFreeTrial: async (accountSize) => {
        const { account } = await accountsApi.createFreeTrial(accountSize)
        set((state) => ({
          accounts: [account, ...state.accounts.filter((a) => a.id !== account.id)],
          activeAccountId: account.id,
        }))
        return account
      },

      createPaid: async (options) => {
        const { account } = await accountsApi.createPaidAccount({
          planId: options.planId,
          accountSize: options.accountSize,
        })
        set((state) => ({
          accounts: [account, ...state.accounts.filter((a) => a.id !== account.id)],
          activeAccountId: account.id,
        }))
        return account
      },

      hasAccounts: (userId) =>
        get().accounts.some((a) => a.userId === userId),

      upsertAccount: (account) =>
        set((state) => {
          const exists = state.accounts.some((a) => a.id === account.id)
          return {
            accounts: exists
              ? state.accounts.map((a) => (a.id === account.id ? account : a))
              : [account, ...state.accounts],
          }
        }),
    }),
    {
      name: 'tv-evaluation-accounts',
      partialize: (state) => ({
        activeAccountId: state.activeAccountId,
      }),
    },
  ),
)
