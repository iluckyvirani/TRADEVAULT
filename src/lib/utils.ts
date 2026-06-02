import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number,
  currency = 'INR',
  locale = 'en-IN',
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** e.g. 10_00_000 → "₹10,00,000" without decimals */
export function formatCurrencyWhole(amount: number, currency = 'INR', locale = 'en-IN') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** e.g. 1_000_000 → "10L" */
export function formatBalanceLabel(amount: number): string {
  if (amount >= 10_00_000) return `${amount / 100_000}L`
  if (amount >= 100_000) return `${amount / 100_000}L`
  return `${amount / 1000}K`
}
